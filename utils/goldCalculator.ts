interface CalculationInputs {
    goldPricePerGram: number;
    weight: number;
    manufFeePercent: number;
    sellerProfitPercent: number;
    vatPercent: number;
}

interface CalculatedValues {
    pricePerGram18kToman: number;
    rawGoldPrice: number;
    manufacturingCost: number;
    sellerProfit: number;
    subtotalBeforeVAT: number;
    vatAmount: number;
    finalPrice: number;
}

/**
 * Calculates the final price of manufactured gold based on inputs.
 * @param inputs - Object containing all necessary input values.
 * @returns CalculatedValues object or null if essential inputs are missing.
 */
export const calculateGoldPrice = (inputs: CalculationInputs): CalculatedValues | null => {
    const {
        goldPricePerGram,
        weight,
        manufFeePercent,
        sellerProfitPercent,
        vatPercent
    } = inputs;

    // Essential input validation
    if (goldPricePerGram <= 0 || weight <= 0) {
        return null;
    }

    const pricePerGram18kToman = goldPricePerGram;

    // 1. Raw Gold Price (قیمت خام طلا)
    const rawGoldPrice = weight * pricePerGram18kToman;

    // 2. Manufacturing Cost (اجرت ساخت) - based on a percentage of the raw gold price
    const manufacturingCost = rawGoldPrice * (manufFeePercent / 100);

    // 3. Subtotal for Calculation of Seller Profit
    const subtotalForProfit = rawGoldPrice + manufacturingCost;

    // 4. Seller Profit (سود فروشنده) - based on subtotal (raw + manuf cost)
    const sellerProfit = subtotalForProfit * (sellerProfitPercent / 100);

    // 5. Subtotal Before VAT (جمع کل قبل از مالیات)
    const subtotalBeforeVAT = subtotalForProfit + sellerProfit;

    // 6. VAT Amount (مالیات بر ارزش افزوده) - applied only to (manufacturingCost + sellerProfit)
    // NOTE: Based on common Iranian gold market rules, VAT is applied to the 'manuf cost' and 'profit', not the raw gold price.
    const vatBase = manufacturingCost + sellerProfit;
    const vatAmount = vatBase * (vatPercent / 100);

    // 7. Final Price (قیمت نهایی)
    const finalPrice = subtotalBeforeVAT + vatAmount;

    return {
        pricePerGram18kToman,
        rawGoldPrice,
        manufacturingCost,
        sellerProfit,
        subtotalBeforeVAT,
        vatAmount,
        finalPrice,
    };
};