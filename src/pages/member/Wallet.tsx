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
  };
  transactions: Transaction[];
}

interface PaymentUrlResponse {
  url: string;
}

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchWalletData();
    checkPaymentSuccess();
  }, []);

  const fetchWalletData = async () => {
    try {
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
      setBalance(data.wallet.balance);
      setTransactions(data.transactions);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu ví:", error);
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

        alert("Thanh toán thành công! Số dư sẽ được cập nhật.");
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

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Ví điện tử</h1>
      <p className="text-lg font-semibold">Số dư: ${balance}</p>
      
      <div className="my-4">
        <h2 className="text-lg font-semibold mb-2">Nạp tiền</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="number"
            min="1"
            value={depositAmount}
            onChange={(e) => setDepositAmount(Number(e.target.value))}
            className="border rounded-lg p-2 w-full md:w-40"
            placeholder="Nhập số tiền"
          />
          <button 
            onClick={handleDeposit} 
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-gray-400"
          >
            {isLoading ? "Đang xử lý..." : "Nạp tiền"}
          </button>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mt-6">Lịch sử giao dịch</h2>
      <ul className="mt-2">
        {transactions.map((t) => (
          <li key={t.transactionId} className="border-b py-2 flex justify-between">
            <span>{new Date(t.createdAt).toLocaleDateString()} - {t.description}</span>
            <span className={t.amount > 0 ? "text-green-600" : "text-red-600"}>
              {t.amount > 0 ? "+" : "-"}${Math.abs(t.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Wallet;