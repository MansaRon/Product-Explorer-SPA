/**
    * Calculate tax amount based on subtotal and rate
    * @param subtotal The subtotal amount
    * @param rate Tax rate (default 15% for South African VAT)
    * @returns Tax amount
*/
export function calculateTax(subtotal: number, rate: number = 0.15): number {
    return subtotal * rate;
}
  
/**
    * Calculate total including subtotal, delivery, and tax
   * @param subtotal Item subtotal
   * @param delivery Delivery cost
   * @param tax Tax amount
   * @returns Total amount
*/
export function calculateTotal(
    subtotal: number,
    delivery: number,
    tax: number
): number {
    return subtotal + delivery + tax;
}
  
/**
   * Calculate tax on subtotal plus delivery
   * @param subtotal Item subtotal
   * @param delivery Delivery cost
   * @param rate Tax rate (default 15%)
   * @returns Tax amount on total before tax
*/
export function calculateTaxOnTotal(
    subtotal: number,
    delivery: number,
    rate: number = 0.15
): number {
    return (subtotal + delivery) * rate;
}
  
/**
   * Calculate order summary with all amounts
   * @param subtotal Item subtotal
   * @param deliveryCost Delivery cost
   * @param taxRate Tax rate (default 15%)
   * @returns Object with all calculated amounts
*/
export function calculateOrderSummary(
    subtotal: number,
    deliveryCost: number,
    taxRate: number = 0.15
) {
    const tax = calculateTaxOnTotal(subtotal, deliveryCost, taxRate);
    const total = subtotal + deliveryCost + tax;
  
    return {
      subtotal,
      delivery: deliveryCost,
      tax,
      total
    };
}