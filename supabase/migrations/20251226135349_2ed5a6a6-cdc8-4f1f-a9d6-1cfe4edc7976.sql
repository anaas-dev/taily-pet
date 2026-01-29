-- Create enum for sitter profile status
CREATE TYPE public.sitter_status AS ENUM ('pending_approval', 'active', 'rejected', 'suspended');

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'sitter');

-- Create profiles table for all users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create sitter_profiles table
CREATE TABLE public.sitter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status public.sitter_status NOT NULL DEFAULT 'pending_approval',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  experience TEXT,
  hourly_rate DECIMAL(10, 2),
  services TEXT[] DEFAULT '{}',
  accepted_pet_types TEXT[] DEFAULT '{}',
  accepted_pet_sizes TEXT[] DEFAULT '{}',
  town TEXT NOT NULL,
  address TEXT,
  photos TEXT[] DEFAULT '{}',
  weekly_schedule JSONB DEFAULT '{}',
  availability_overrides JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_notifications table
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  sitter_id UUID REFERENCES public.sitter_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id UUID REFERENCES public.sitter_profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for sitter_profiles
CREATE POLICY "Anyone can view active sitter profiles" ON public.sitter_profiles
  FOR SELECT USING (status = 'active');

CREATE POLICY "Sitters can view their own profile" ON public.sitter_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sitters can insert their own profile" ON public.sitter_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sitters can update their own profile" ON public.sitter_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sitter profiles" ON public.sitter_profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any sitter profile" ON public.sitter_profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for admin_notifications
CREATE POLICY "Admins can view all notifications" ON public.admin_notifications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update notifications" ON public.admin_notifications
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own sent messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- RLS Policies for bookings
CREATE POLICY "Sitters can view their bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sitter_profiles WHERE id = sitter_id AND user_id = auth.uid())
  );

CREATE POLICY "Owners can view their bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Sitters and owners can update bookings" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM public.sitter_profiles WHERE id = sitter_id AND user_id = auth.uid())
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sitter_profiles_updated_at
  BEFORE UPDATE ON public.sitter_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create admin notification on new sitter application
CREATE OR REPLACE FUNCTION public.notify_admin_new_sitter()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, sitter_id, message)
  VALUES ('new_application', NEW.id, 'New sitter application from ' || NEW.first_name || ' ' || NEW.last_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_new_sitter_application
  AFTER INSERT ON public.sitter_profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_sitter();

-- Function to notify admin when active sitter updates their profile
CREATE OR REPLACE FUNCTION public.notify_admin_sitter_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'active' AND (
    OLD.services IS DISTINCT FROM NEW.services OR
    OLD.weekly_schedule IS DISTINCT FROM NEW.weekly_schedule OR
    OLD.availability_overrides IS DISTINCT FROM NEW.availability_overrides
  ) THEN
    INSERT INTO public.admin_notifications (type, sitter_id, message)
    VALUES ('profile_update', NEW.id, NEW.first_name || ' ' || NEW.last_name || ' updated their services or availability');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_active_sitter_update
  AFTER UPDATE ON public.sitter_profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_sitter_update();

-- Function to handle new user signup (create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  -- Give default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;