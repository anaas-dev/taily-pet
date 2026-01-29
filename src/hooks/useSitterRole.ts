import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useSitterRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [isApprovedSitter, setIsApprovedSitter] = useState(false);
  const [sitterProfileId, setSitterProfileId] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkSitterRole = async () => {
      if (!user) {
        setIsApprovedSitter(false);
        setSitterProfileId(null);
        setCheckingRole(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("sitter_profiles")
          .select("id, status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!error && data && data.status === "active") {
          setIsApprovedSitter(true);
          setSitterProfileId(data.id);
        } else {
          setIsApprovedSitter(false);
          setSitterProfileId(null);
        }
      } catch (error) {
        console.error("Error checking sitter role:", error);
        setIsApprovedSitter(false);
        setSitterProfileId(null);
      } finally {
        setCheckingRole(false);
      }
    };

    if (!authLoading) {
      checkSitterRole();
    }
  }, [user, authLoading]);

  return { 
    isApprovedSitter, 
    sitterProfileId, 
    checkingRole, 
    loading: authLoading || checkingRole 
  };
};
