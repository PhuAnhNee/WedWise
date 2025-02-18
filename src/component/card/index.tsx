import { EditOutlined, EllipsisOutlined, SettingOutlined } from "@ant-design/icons";
import { Avatar, Card } from "antd";

const { Meta } = Card;

interface ApartmentCardProps {
    title: string;
    description: string;
    imageUrl: string;
    avatarUrl: string;
    className?: string; // Cho phép className là optional
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({
    title,
    description,
    imageUrl,
    avatarUrl,
    className = "",
}) => (
    <Card
        className={className}
        style={{ width: 300 }}
        cover={<img alt="apartment" src={imageUrl} />}
        actions={[
            <SettingOutlined key="setting" />,
            <EditOutlined key="edit" />,
            <EllipsisOutlined key="ellipsis" />,
        ]}
    >
        <Meta
            avatar={<Avatar src={avatarUrl} />}
            title={title}
            description={description}
        />
    </Card>
);

export default ApartmentCard;
