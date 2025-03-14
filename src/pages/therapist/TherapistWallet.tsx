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

interface PaymentUrlResponse {
  url: string;
}

const TherapistWallets: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  useEffect(() => {
    fetchWalletData();
    checkPaymentSuccess();
  }, []);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const token = AuthService.getToken();
      if (!token) {
        throw new Error("Vui lòng đăng nhập để xem số dư");
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
        throw new Error("Không thể lấy dữ liệu ví");
      }
      
      const data: WalletData = await response.json();
      setWalletData(data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu ví:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentSuccess = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const responseCode = urlParams.get("vnp_ResponseCode");
    const email = urlParams.get("vnp_OrderInfo");
    const amount = urlParams.get("vnp_Amount");

    if (responseCode === "00" && email && amount) {
      try {
        const token = AuthService.getToken();
        if (!token) {
          throw new Error("Vui lòng đăng nhập để xác nhận thanh toán");
        }

        const response = await fetch(
          "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Payment/Process_Payment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ email, amount: Number(amount) / 100 }),
          }
        );

        if (!response.ok) {
          throw new Error("Xác nhận thanh toán thất bại");
        }

        alert("Thanh toán thành công! Số dư đã được cập nhật.");
        fetchWalletData();
        // Xóa tham số URL và điều hướng về trang ví
        window.history.replaceState(null, "", "https://wed-wise-mu.vercel.app/home/wallet");

      } catch (error) {
        console.error("Lỗi khi xử lý thanh toán:", error);
      }
    }
  };

  const getPaymentUrl = async (amount: number) => {
    try {
      setIsLoading(true);
      const token = AuthService.getToken();
      
      if (!token) {
        throw new Error("Vui lòng đăng nhập để thực hiện giao dịch");
      }
      
      const response = await fetch(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Payment/Get_Payment_Url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ amount }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Không thể lấy URL thanh toán");
      }
  
      const data: PaymentUrlResponse = await response.json();
      return data.url;
    } catch (error) {
      console.error("Lỗi khi lấy URL thanh toán:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (depositAmount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    const paymentUrl = await getPaymentUrl(depositAmount);
    if (paymentUrl) {
      window.open(paymentUrl, "_blank");
      alert("Sau khi hoàn thành thanh toán, vui lòng tải lại trang để cập nhật số dư.");
    }
  };

  const handleWithdraw = async () => {
    if (!walletData) return;
    
    if (withdrawAmount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (withdrawAmount > walletData.wallet.balance) {
      alert("Số tiền rút không được vượt quá số dư hiện tại");
      return;
    }

    try {
      setIsWithdrawLoading(true);
      const token = AuthService.getToken();
      
      if (!token) {
        throw new Error("Vui lòng đăng nhập để thực hiện giao dịch");
      }
      
      const response = await fetch(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Withdraw/Create_Withdraw",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            customerId: walletData.wallet.userId, 
            money: withdrawAmount 
          }),
        }
      );
  console.log(walletData.wallet.userId);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Rút tiền thất bại");
      }
  
      alert("Yêu cầu rút tiền đã được gửi thành công!");
      fetchWalletData();
    } catch (error) {
      console.error("Lỗi khi rút tiền:", error);
      alert(error instanceof Error ? error.message : "Rút tiền thất bại");
    } finally {
      setIsWithdrawLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && !walletData) {
    return (
      <div className="max-w-lg mx-auto p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Đang tải dữ liệu ví...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">Ví điện tử</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6 shadow-sm">
        <p className="text-gray-500 text-sm">Số dư hiện tại</p>
        <p className="text-3xl font-bold text-blue-700">
          {walletData?.wallet.balance?.toLocaleString('vi-VN')} VNĐ
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-2 text-center ${activeTab === 'deposit' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('deposit')}
          >
            Nạp tiền
          </button>
          <button
            className={`flex-1 py-2 text-center ${activeTab === 'withdraw' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('withdraw')}
          >
            Rút tiền
          </button>
        </div>
        
        {activeTab === 'deposit' && (
          <div className="mt-4">
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Số tiền nạp (VNĐ)</label>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số tiền"
                />
              </div>
              <button 
                onClick={handleDeposit} 
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-gray-400 hover:bg-green-600 transition-colors w-full"
              >
                {isLoading ? "Đang xử lý..." : "Nạp tiền"}
              </button>
              <p className="text-xs text-gray-500 italic">Số tiền sẽ được cộng vào ví sau khi thanh toán thành công.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'withdraw' && (
          <div className="mt-4">
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Số tiền rút (VNĐ)</label>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  max={walletData?.wallet.balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số tiền"
                />
              </div>
              <button 
                onClick={handleWithdraw} 
                disabled={isWithdrawLoading || !walletData || withdrawAmount > walletData.wallet.balance}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:bg-gray-400 hover:bg-orange-600 transition-colors w-full"
              >
                {isWithdrawLoading ? "Đang xử lý..." : "Rút tiền"}
              </button>
              <p className="text-xs text-gray-500 italic">Yêu cầu rút tiền sẽ được xử lý trong vòng 24 giờ.</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2">Lịch sử giao dịch</h2>
        {walletData && walletData.transactions.length > 0 ? (
          <ul className="mt-2 divide-y divide-gray-100">
            {walletData.transactions.map((t) => (
              <li key={t.transactionId} className="py-3 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{t.description}</span>
                  <span className="text-xs text-gray-500">{formatDate(t.createdAt)}</span>
                </div>
                <span className={`font-medium ${t.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                  {t.amount > 0 ? "+" : "-"}{Math.abs(t.amount).toLocaleString('vi-VN')} VNĐ
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-4">Chưa có giao dịch nào</p>
        )}
      </div>
    </div>
  );
};

export default TherapistWallets;