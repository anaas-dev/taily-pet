import { Dog, Cat, Bird, Rabbit, HelpCircle } from "lucide-react";

export const cyprusTowns = [
  "Nicosia",
  "Limassol",
  "Larnaca",
  "Paphos",
  "Famagusta",
  "Kyrenia",
  "Paralimni",
  "Aradippou",
  "Strovolos",
  "Lakatamia",
  "Latsia",
  "Agios Dometios",
  "Kato Polemidia",
  "Aglandjia",
  "Ayia Napa",
  "Protaras",
  "Polis",
  "Pegeia",
  "Geroskipou",
];

export const towns = cyprusTowns.map((town) => ({
  value: town.toLowerCase().replace(/\s+/g, "-"),
  label: town,
}));

export const petTypes = [
  { value: "dog", label: "Dog", icon: Dog },
  { value: "cat", label: "Cat", icon: Cat },
  { value: "bird", label: "Bird", icon: Bird },
  { value: "rabbit", label: "Rabbit", icon: Rabbit },
  { value: "other", label: "Other", icon: HelpCircle },
];

export const petSizes = [
  { value: "small", label: "Small (0-10kg)" },
  { value: "medium", label: "Medium (10-25kg)" },
  { value: "large", label: "Large (25-45kg)" },
  { value: "giant", label: "Giant (45kg+)" },
];

export const serviceTypes = [
  { value: "pet-sitting", label: "Pet Sitting" },
  { value: "dog-walking", label: "Dog Walking" },
  { value: "overnight-care", label: "Overnight Care" },
  { value: "house-visits", label: "House Visits" },
  { value: "grooming", label: "Grooming" },
];

export interface SearchFilters {
  petTypes: string[];
  towns: string[];
  petSizes: string[];
  services: string[];
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
}

