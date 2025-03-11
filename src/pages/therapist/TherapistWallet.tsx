import { Button } from "../../component/ui/button";
import { Card, CardContent } from "../../component/ui/card";
import { Input } from "../../component/ui/input";
import { Modal } from "../../component/ui/modal";
import { useState } from "react";

interface Transaction {
  id: number;
  type: "deposit" | "withdrawal";
  amount: number;
  date: string;
}
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Wallet() {
  const [balance, setBalance] = useState(5000);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: "deposit", amount: 2000, date: "2025-03-10" },
    { id: 2, type: "withdrawal", amount: 1000, date: "2025-03-09" },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const handleWithdrawRequest = () => {
    if (withdrawAmount > 0 && withdrawAmount <= balance) {
      setBalance(balance - withdrawAmount);
      setTransactions([
        ...transactions,
        { id: transactions.length + 1, type: "withdrawal", amount: withdrawAmount, date: new Date().toISOString().split("T")[0] },
      ]);
      setIsModalOpen(false);
      setWithdrawAmount(0);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold">Số dư: {balance} VND</h2>
          <Button onClick={() => setIsModalOpen(true)}>Rút tiền</Button>
        </CardContent>
      </Card>
      
      <h3 className="mt-4 text-lg font-semibold">Lịch sử giao dịch</h3>
      {transactions.map((txn) => (
        <Card key={txn.id} className="mt-2">
          <CardContent>
            <p>{txn.type === "deposit" ? "Nạp tiền" : "Rút tiền"}: {txn.amount} VND</p>
            <p className="text-sm text-gray-500">Ngày: {txn.date}</p>
          </CardContent>
        </Card>
      ))}
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4">
          <h2 className="text-xl font-bold">Yêu cầu rút tiền</h2>
          <p>Số dư khả dụng: {balance} VND</p>
          <Input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(Number(e.target.value))}
            placeholder="Nhập số tiền cần rút"
          />
          <Button onClick={handleWithdrawRequest} className="mt-2">Xác nhận</Button>
        </div>
      </Modal>
    </div>
  );
}
