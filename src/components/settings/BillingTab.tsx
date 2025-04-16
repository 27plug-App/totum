import React, { useState, useEffect } from 'react';

function BillingTab(user: any) {
  const [cards, setCards] = useState([
    // Example card data; replace with actual data fetching logic
    { id: 1, cardNumber: '**** **** **** 1234', expiryDate: '12/23', cardBrand: 'Visa' },
    { id: 2, cardNumber: '**** **** **** 5678', expiryDate: '11/24', cardBrand: 'MasterCard' },
  ]);

  // Simulate fetching card data
  useEffect(() => {
    // Fetch card data from backend and update state
    // Example: setCards(fetchedCardData);
  }, []);

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Billing Settings</h2>
      
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-800 mb-2">Your Cards</h3>
        <ul className="space-y-2">
          {cards.map(card => (
            <li key={card.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">{card.cardNumber}</p>
                <p className="text-xs text-gray-500">Expires {card.expiryDate}</p>
                <p className="text-xs font-semibold text-gray-700">{card.cardBrand}</p>
              </div>
              <button className="text-sm text-blue-600 hover:underline">Remove</button>
            </li>
          ))}
        </ul>
      </div>

      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="cardNumber">
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="1234 5678 9012 3456"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="expiryDate">
            Expiry Date
          </label>
          <input
            type="text"
            id="expiryDate"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="MM/YY"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="cvv">
            CVV
          </label>
          <input
            type="text"
            id="cvv"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="123"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Card
          </button>
        </div>
      </form>
    </div>
  );
}

export default BillingTab;