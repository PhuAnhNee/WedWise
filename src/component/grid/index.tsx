import React from "react";
import { Card } from "antd";

const gridStyle: React.CSSProperties = {
    width: "25%", // 4 cột trong 1 hàng
    textAlign: "center",
    padding: "20px",
};

const imageStyle: React.CSSProperties = {
    width: "150px",
    height: "150px",
    objectFit: "cover",
    borderRadius: "8px",
};

const ApartmentGrid: React.FC = () => {
    const apartments = ["D", "E", "F", "G", "H", "I", "F", "G"];
    const imageUrl =
        "https://ecogreen-saigon.vn/uploads/phong-tro-la-loai-hinh-nha-o-pho-bien-gia-re-tien-loi-cho-sinh-vien-va-nguoi-di-lam.png"; // Ảnh cố định

    return (
        <Card title="🏡 Các căn hộ khác">
            {apartments.map((item, index) => (
                <Card.Grid key={index} style={gridStyle}>
                    {/* Dùng style trực tiếp để cố định ảnh 50x50px */}
                    <div className="flex justify-center">
                        <img src={imageUrl} alt="Phòng trọ" style={imageStyle} />
                    </div>
                    <h3 className="mt-2 font-semibold">Căn hộ {item} - Quận {index + 4}</h3>
                    <p className="text-sm text-gray-500">5.5 triệu/tháng • 25m²</p>
                    <span className="text-sm text-yellow-500">⭐ 4.6/5</span>
                </Card.Grid>
            ))}
        </Card>
    );
};

export default ApartmentGrid;
