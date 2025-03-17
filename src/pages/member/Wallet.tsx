import React, { useState, useEffect } from "react";
import AuthService from "../service/AuthService";
import { motion } from "framer-motion";

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

interface WithdrawResponse {
  success: boolean;
  message: string;
}

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    fetchWalletData();
    checkPaymentSuccess();
  }, []);

  const fetchWalletData = async () => {
    try {
      setIsFetching(true);
      const token = AuthService.getToken();
      if (!token) throw new Error("Vui lòng đăng nhập để xem số dư");

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

      if (!response.ok) throw new Error("Không thể lấy dữ liệu ví");

      const data: WalletData = await response.json();
      setBalance(data.wallet.balance);
      setTransactions(data.transactions);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu ví:", error);
      alert("Không thể tải dữ liệu ví. Vui lòng thử lại sau.");
    } finally {
      setIsFetching(false);
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
        if (!token) throw new Error("Vui lòng đăng nhập để xác nhận thanh toán");

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

        if (!response.ok) throw new Error("Xác nhận thanh toán thất bại");

        alert("Thanh toán thành công! Trang sẽ được tải lại.");
        window.location.href = "https://wed-wise-mu.vercel.app/home/wallet";
      } catch (error) {
        console.error("Lỗi khi xử lý thanh toán:", error);
        alert("Lỗi xử lý thanh toán. Vui lòng liên hệ hỗ trợ.");
      }
    }
  };

  const getPaymentUrl = async (amount: number) => {
    try {
      setIsLoading(true);
      const token = AuthService.getToken();
      if (!token) throw new Error("Vui lòng đăng nhập để thực hiện giao dịch");

      const response = await fetch(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Payment/Get_Payment_Url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ amount }),
        }
      );

      if (!response.ok) throw new Error("Không thể lấy URL thanh toán");

      const data: PaymentUrlResponse = await response.json();
      return data.url;
    } catch (error) {
      console.error("Lỗi khi lấy URL thanh toán:", error);
      alert("Không thể tạo link thanh toán. Vui lòng thử lại.");
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
      alert("Sau khi hoàn thành thanh toán, trang sẽ được tải lại.");
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (withdrawAmount > balance) {
      alert("Số dư không đủ để thực hiện rút tiền");
      return;
    }

    try {
      setIsWithdrawLoading(true);
      const token = AuthService.getToken();
      if (!token) throw new Error("Vui lòng đăng nhập để thực hiện rút tiền");

      const decodedToken = AuthService.getDecodedToken();
      if (!decodedToken || !decodedToken.UserId) throw new Error("Không thể xác định thông tin người dùng");

      const response = await fetch(
        "https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Withdraw/Create_Withdraw",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerId: decodedToken.UserId,
            money: withdrawAmount
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể rút tiền");
      }

      const data: WithdrawResponse = await response.json();
      console.log(data);
      
      alert("Yêu cầu rút tiền đã được gửi thành công. Trang sẽ được tải lại.");
      
      // Reload trang sau khi rút tiền thành công
      window.location.reload();
    } catch (error) {
      console.error("Lỗi khi thực hiện rút tiền:", error);
      alert(error instanceof Error ? error.message : "Không thể rút tiền. Vui lòng thử lại sau.");
    } finally {
      setIsWithdrawLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-xl overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
          <h1 className="text-3xl font-bold">Ví điện tử</h1>
          {isFetching ? (
            <p className="text-2xl mt-2 animate-pulse">Đang tải...</p>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold mt-2"
            >
              Số dư: ${balance.toLocaleString()}
            </motion.p>
          )}
        </div>

        {/* Deposit Section */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Nạp tiền</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <motion.input
              type="number"
              min="1"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              whileFocus={{ scale: 1.02 }}
              className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
              placeholder="Nhập số tiền"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeposit}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:bg-indigo-700"
            >
              {isLoading ? "Đang xử lý..." : "Nạp tiền"}
            </motion.button>
          </div>
        </div>

        {/* Withdraw Section */}
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Rút tiền</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <motion.input
              type="number"
              min="1"
              max={balance}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              whileFocus={{ scale: 1.02 }}
              className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
              placeholder="Nhập số tiền"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWithdraw}
              disabled={isWithdrawLoading || withdrawAmount > balance}
              className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:bg-green-700"
            >
              {isWithdrawLoading ? "Đang xử lý..." : "Rút tiền"}
            </motion.button>
          </div>
          <p className="text-sm text-gray-600 mt-2">Yêu cầu rút tiền sẽ được xử lý trong vòng 24 giờ làm việc.</p>
        </div>

        {/* Transactions Section */}
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Lịch sử giao dịch</h2>
          {isFetching ? (
            <p className="text-gray-500 text-center py-4 animate-pulse">Đang tải lịch sử...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Chưa có giao dịch nào</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transactions.map((t, index) => (
                <motion.div
                  key={t.transactionId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div>
                    <p className="text-gray-800 font-medium">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 text-sm">{t.description}</p>
                  </div>
                  <span
                    className={`font-semibold ${t.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {t.amount > 0 ? "+" : "-"}${Math.abs(t.amount).toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Wallet;