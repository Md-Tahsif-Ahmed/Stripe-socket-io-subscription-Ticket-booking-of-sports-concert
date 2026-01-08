export const calculateServiceFee = (user: any, subtotal: number) => {
  if (user?.isPremium) return 0;
  return Math.round(subtotal * 0.05);
};

