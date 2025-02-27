import React, { useState, useEffect } from "react";

interface Transaction {
  id: string;
  type: "Deposit" | "Withdraw";
  amount: number;
  date: string;
}

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState<number>(1000); // Giả sử số dư ban đầu là 1000
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Giả sử lấy lịch sử giao dịch từ API (mock data)
    setTransactions([
      { id: "1", type: "Deposit", amount: 500, date: "2025-02-18" },
      { id: "2", type: "Withdraw", amount: 200, date: "2025-02-19" },
    ]);
  }, []);

  const handleTransaction = (type: "Deposit" | "Withdraw") => {
    const amount = type === "Deposit" ? 100 : -100; // Giả sử nạp/rút 100
    setBalance((prev) => prev + amount);
    setTransactions((prev) => [
      { id: Date.now().toString(), type, amount: Math.abs(amount), date: new Date().toISOString().split("T")[0] },
      ...prev,
    ]);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Wallet</h1>
      <p className="text-lg font-semibold">Balance: ${balance}</p>
      <div className="flex gap-4 my-4">
        <button onClick={() => handleTransaction("Deposit")} className="px-4 py-2 bg-green-500 text-white rounded-lg">
          Deposit
        </button>
        <button onClick={() => handleTransaction("Withdraw")} className="px-4 py-2 bg-red-500 text-white rounded-lg">
          Withdraw
        </button>
      </div>
      <h2 className="text-xl font-semibold mt-6">Transaction History</h2>
      <ul className="mt-2">
        {transactions.map((t) => (
          <li key={t.id} className="border-b py-2">
            {t.date} - {t.type} ${t.amount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Wallet;
