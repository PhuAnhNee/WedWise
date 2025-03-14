import { Button } from "../../component/ui/button";
import { Card, CardContent } from "../../component/ui/card";
import { Input } from "../../component/ui/input";
import Modal from "../../component/ui/modal"; 
import { useState } from "react";

interface Transaction {
  id: number;
  type: "deposit" | "withdrawal";
  amount: number;
  date: string;
}

export default function Wallet() {
  const [balance, setBalance] = useState(5000);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: "deposit", amount: 2000, date: "2025-03-10" },
    { id: 2, type: "withdrawal", amount: 1000, date: "2025-03-09" },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleWithdrawRequest = () => {
    const amount = Number(withdrawAmount);
    if (amount > 0 && amount <= balance) {
      setBalance(balance - amount);
      setTransactions([
        ...transactions,
        { id: transactions.length + 1, type: "withdrawal", amount, date: new Date().toISOString().split("T")[0] },
      ]);
      setIsModalOpen(false);
      setWithdrawAmount("");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold">Số dư: {balance.toLocaleString()} VND</h2>
          <Button onClick={() => setIsModalOpen(true)}>Rút tiền</Button>
        </CardContent>
      </Card>
      
      <h3 className="mt-4 text-lg font-semibold">Lịch sử giao dịch</h3>
      {transactions.map((txn) => (
        <Card key={txn.id} className="mt-2">
          <CardContent>
            <p>{txn.type === "deposit" ? "Nạp tiền" : "Rút tiền"}: {txn.amount.toLocaleString()} VND</p>
            <p className="text-sm text-gray-500">Ngày: {txn.date}</p>
          </CardContent>
        </Card>
      ))}
      
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="p-4">
            <h2 className="text-xl font-bold">Yêu cầu rút tiền</h2>
            <p>Số dư khả dụng: {balance.toLocaleString()} VND</p>
            <Input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Nhập số tiền cần rút"
              min="1"
              max={balance}
            />
            <Button 
              onClick={handleWithdrawRequest} 
              className="mt-2" 
              disabled={!withdrawAmount || Number(withdrawAmount) <= 0}
            >
              Xác nhận
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
