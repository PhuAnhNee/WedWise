import React, { useState, useEffect } from "react";
import AuthService from "../service/AuthService";

interface Transaction {
  transactionId: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface WalletData {
  wallet: {
    walletId: string;
    balance: number;
    userId: string;
  };
  transactions: Transaction[];
}

const TherapistWallets: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const token = AuthService.getToken();
      if (!token) {
        throw new Error("Please log in to view your balance");
      }

      const response = await fetch(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Auth/GetWallet",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to fetch wallet data");
      }

      const data: WalletData = await response.json();
      setWalletData(data);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!walletData) return;

    if (withdrawAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > walletData.wallet.balance) {
      alert("Withdrawal amount cannot exceed current balance");
      return;
    }

    try {
      setIsWithdrawLoading(true);
      const token = AuthService.getToken();

      if (!token) {
        throw new Error("Please log in to perform this transaction");
      }

      const response = await fetch(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Withdraw/Create_Withdraw",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerId: walletData.wallet.userId,
            money: withdrawAmount,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Withdrawal failed");
      }

      alert("Withdrawal request submitted successfully!");
      fetchWalletData();
    } catch (error) {
      console.error("Error during withdrawal:", error);
      alert(error instanceof Error ? error.message : "Withdrawal failed");
    } finally {
      setIsWithdrawLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading && !walletData) {
    return (
      <div className="max-w-lg mx-auto p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">Wallet</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-6 shadow-sm">
        <p className="text-gray-500 text-sm">Current Balance</p>
        <p className="text-3xl font-bold text-blue-700">
          {walletData?.wallet.balance?.toLocaleString("en-US")} VND
        </p>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <div className="flex-1 py-2 text-center border-b-2 border-blue-500 text-blue-600 font-medium">
            Withdraw
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Withdrawal Amount (VND)</label>
              <input
                type="number"
                min="10000"
                step="10000"
                max={walletData?.wallet.balance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawLoading || !walletData || withdrawAmount > walletData.wallet.balance}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:bg-gray-400 hover:bg-orange-600 transition-colors w-full"
            >
              {isWithdrawLoading ? "Processing..." : "Withdraw"}
            </button>
            <p className="text-xs text-gray-500 italic">Withdrawal requests will be processed within 24 hours.</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2">Transaction History</h2>
        {walletData && walletData.transactions.length > 0 ? (
          <ul className="mt-2 divide-y divide-gray-100">
            {walletData.transactions.map((t) => (
              <li key={t.transactionId} className="py-3 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{t.description}</span>
                  <span className="text-xs text-gray-500">{formatDate(t.createdAt)}</span>
                </div>
                <span className={`font-medium ${t.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                  {t.amount > 0 ? "+" : "-"}{Math.abs(t.amount).toLocaleString("en-US")} VND
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-4">No transactions yet</p>
        )}
      </div>
    </div>
  );
};

export default TherapistWallets;