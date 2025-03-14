import { useEffect, useState } from 'react';
import AuthService from '../service/AuthService';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import toast from 'react-hot-toast';

interface Schedule {
    scheduleId: string;
    therapistId: string;
    date: string;
    slot: number;
    isAvailable: boolean;
}

const TherapistSchedule = () => {
    const [schedule, setSchedule] = useState<Schedule[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    
    useEffect(() => {
        const fetchSchedule = async () => {
            const token = AuthService.getToken();
            if (!token) {
                console.error('Người dùng chưa đăng nhập hoặc thiếu quyền truy cập.');
                return;
            }

            try {
                const response = await fetch(
                    'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Schedule/Get_Schedule_By_TherapistId',
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`Lỗi: ${response.statusText}`);
                }

                const data: Schedule[] = await response.json();
                setSchedule(data);
            } catch (error) {
                console.error('Lỗi khi lấy lịch trình:', error);
            }
        };

        fetchSchedule();
    }, []);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const markedDates = new Set(schedule.map(slot => formatDate(new Date(slot.date))));

    const handleDelete = async (scheduleItem: Schedule) => {
        const token = AuthService.getToken();
        if (!token) {
            console.error('Người dùng chưa đăng nhập hoặc thiếu quyền truy cập.');
            return;
        }

        const requestData = [{
            scheduleId: scheduleItem.scheduleId,
            therapistId: scheduleItem.therapistId,
            date: scheduleItem.date,
            slot: scheduleItem.slot,
            isAvailable: false
        }];

        try {
            const response = await fetch(
                'https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Schedule/Update_Schedule',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                }
            );

            if (!response.ok) {
                throw new Error(`Lỗi: ${response.statusText}`);
            }

            setSchedule(prevSchedule => prevSchedule.map(slot =>
                slot.scheduleId === scheduleItem.scheduleId ? { ...slot, isAvailable: false } : slot
            ));
            toast.success("Xóa lịch thành công!");
        } catch (error) {
            console.error('Lỗi khi cập nhật lịch:', error);
            toast.error("Không thể xóa lịch, vui lòng thử lại!");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Lịch làm việc của Therapist</h2>
            <div className="flex justify-center">
                <Calendar 
                    onChange={(value) => setSelectedDate(value as Date | null)} 
                    value={selectedDate} 
                    tileClassName={({ date }) => 
                        markedDates.has(formatDate(date)) ? 'bg-green-300 text-white font-bold rounded-lg' : 'hover:bg-gray-200 rounded-lg'
                    }
                    className="mb-6 border rounded-xl shadow-md p-2"
                />
            </div>
            {selectedDate && (
                <div className="bg-gray-50 p-5 rounded-xl shadow-md mt-4">
                    <h3 className="text-xl font-semibold mb-4 text-center">Lịch làm việc ngày {selectedDate.toLocaleDateString()}</h3>
                    <ul>
                        {schedule.filter(slot => formatDate(new Date(slot.date)) === formatDate(selectedDate))
                            .map((slot) => (
                                <li key={slot.scheduleId} className="p-4 bg-white rounded-lg shadow-md mb-3 flex justify-between items-center border border-gray-200">
                                    <span><strong>Slot:</strong> {slot.slot} | <strong> Tình trạng:</strong> {slot.isAvailable ? 'Còn trống' : 'Đã đặt'}</span>
                                    {slot.isAvailable && (
                                        <button 
                                            onClick={() => handleDelete(slot)} 
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TherapistSchedule;
