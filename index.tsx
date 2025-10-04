import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { calculateGoldPrice } from './utils/goldCalculator'; // وارد کردن تابع محاسبه‌گر

// Helper function to format numbers as Toman currency
const formatToman = (value: number): string => {
  if (isNaN(value) || !isFinite(value)) {
    return '۰ تومان';
  }
  // Use 'fa-IR' for Persian formatting and round to the nearest Toman
  return new Intl.NumberFormat('fa-IR').format(Math.round(value)) + ' تومان';
};

// Helper function to convert Persian/Arabic numerals to English numerals
const toEnglishDigits = (str: string): string => {
    if (!str) return '';
    return str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
              .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};


const App: React.FC = () => {
    const [inputs, setInputs] = useState({
        goldPricePerGram: '',
        weight: '',
        manufFeePercent: '',
        sellerProfitPercent: '7',
        vatPercent: '10',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const englishValue = toEnglishDigits(value);

        if (name === 'goldPricePerGram') {
            const numericValue = englishValue.replace(/[^\d]/g, ''); // Remove non-digit characters
            if (numericValue === '') {
                setInputs(prev => ({ ...prev, [name]: '' }));
                return;
            }
            try {
                const number = BigInt(numericValue);
                const formattedValue = new Intl.NumberFormat('fa-IR').format(number);
                setInputs(prev => ({ ...prev, [name]: formattedValue }));
            } catch (err) {
                // Ignore potential BigInt errors on invalid input
            }
        } else {
            // Allow only numbers and a single decimal point for other fields
            if (/^\d*\.?\d*$/.test(englishValue)) {
                setInputs(prev => ({ ...prev, [name]: value }));
            }
        }
    };

    const calculatedValues = useMemo(() => {
        const goldPricePerGram = parseFloat(toEnglishDigits(inputs.goldPricePerGram).replace(/[^\d]/g, '')) || 0;
        const weight = parseFloat(toEnglishDigits(inputs.weight)) || 0;
        const manufFeePercent = parseFloat(toEnglishDigits(inputs.manufFeePercent)) || 0;
        const sellerProfitPercent = parseFloat(toEnglishDigits(inputs.sellerProfitPercent)) || 0;
        const vatPercent = parseFloat(toEnglishDigits(inputs.vatPercent)) || 0;

        // Call the external calculation logic
        return calculateGoldPrice({
            goldPricePerGram,
            weight,
            manufFeePercent,
            sellerProfitPercent,
            vatPercent
        });
    }, [inputs]);
    
    // Check if essential inputs are missing to display a friendly message
    const isReadyForCalculation = (parseFloat(toEnglishDigits(inputs.goldPricePerGram).replace(/[^\d]/g, '')) || 0) > 0 && (parseFloat(toEnglishDigits(inputs.weight)) || 0) > 0;


    return (
        <main className="app-container">
            <h1>محاسبه‌گر قیمت طلا</h1>

            <section className="calculator-form">
                <div className="form-group">
                    <label htmlFor="goldPricePerGram">قیمت هر گرم طلای ۱۸ عیار (تومان)</label>
                    <input type="text" id="goldPricePerGram" name="goldPricePerGram" value={inputs.goldPricePerGram} onChange={handleInputChange} placeholder="مثال: ۳٬۳۵۰٬۰۰۰" inputMode="numeric" aria-label="قیمت هر گرم طلای ۱۸ عیار به تومان"/>
                </div>
                <div className="form-group">
                    <label htmlFor="weight">وزن طلا (گرم)</label>
                    <input type="text" id="weight" name="weight" value={inputs.weight} onChange={handleInputChange} placeholder="مثال: ۱۲.۳۴۵" inputMode="decimal" aria-label="وزن طلا به گرم"/>
                </div>
                <div className="form-group">
                    <label htmlFor="manufFeePercent">اجرت ساخت (درصد)</label>
                    <input type="text" id="manufFeePercent" name="manufFeePercent" value={inputs.manufFeePercent} onChange={handleInputChange} placeholder="مثال: ۱۵" inputMode="decimal" aria-label="اجرت ساخت به درصد"/>
                </div>
                <div className="form-group">
                    <label htmlFor="sellerProfitPercent">سود فروشنده (درصد)</label>
                    <input type="text" id="sellerProfitPercent" name="sellerProfitPercent" value={inputs.sellerProfitPercent} onChange={handleInputChange} inputMode="decimal" aria-label="سود فروشنده به درصد"/>
                </div>
                 <div className="form-group">
                    <label htmlFor="vatPercent">مالیات بر ارزش افزوده (درصد)</label>
                    <input type="text" id="vatPercent" name="vatPercent" value={inputs.vatPercent} onChange={handleInputChange} inputMode="decimal" aria-label="مالیات بر ارزش افزوده به درصد"/>
                </div>
            </section>
            
            <section className="results">
                {!isReadyForCalculation && (
                    <div className="initial-message">
                        <p>لطفاً **قیمت هر گرم طلای ۱۸ عیار** و **وزن طلا** و **اجرت ساخت** را وارد کنید.</p>
                    </div>
                )}
                {calculatedValues && (
                    <>
                        <div className="result-item">
                            <span>قیمت خام طلا</span>
                            <span>{formatToman(calculatedValues.rawGoldPrice)}</span>
                        </div>
                        <div className="result-item">
                            <span>اجرت ساخت ({inputs.manufFeePercent || 0}%)</span>
                            <span>{formatToman(calculatedValues.manufacturingCost)}</span>
                        </div>
                        <div className="result-item">
                            <span>سود فروشنده ({inputs.sellerProfitPercent || 0}%)</span>
                            <span>{formatToman(calculatedValues.sellerProfit)}</span>
                        </div>
                         <div className="result-item">
                            <span>جمع کل قبل از مالیات</span>
                            <span>{formatToman(calculatedValues.subtotalBeforeVAT)}</span>
                        </div>
                        <div className="result-item">
                            <span>مالیات بر ارزش افزوده ({inputs.vatPercent || 0}%)</span>
                            <span>{formatToman(calculatedValues.vatAmount)}</span>
                        </div>
                        <div className="result-item total">
                            <span>قیمت نهایی</span>
                            <span>{formatToman(calculatedValues.finalPrice)}</span>
                        </div>
                    </>
                )}
            </section>
            
            <footer className="app-footer">
                <p>*هزینه استفاده از برنامه*</p>
                <p>اگر با این برنامه در خریدتون سود کردید، لطفا قسمتی از اون رو صرف خرید مواد پروتئینی برای خانواده های نیازمند کنید.</p>
            </footer>
        </main>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
