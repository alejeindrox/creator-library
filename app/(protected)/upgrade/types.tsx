export interface PricingGridProps {
  userPlan: string;
}

export interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  isCurrent: boolean;
  isRecommended?: boolean;
}
