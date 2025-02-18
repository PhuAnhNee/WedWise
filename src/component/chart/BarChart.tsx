import React from 'react';
import { Column } from '@ant-design/charts';

const BarChart: React.FC = () => {
    const data = [
        { type: 'Jan', value: 30 },
        { type: 'Feb', value: 45 },
        { type: 'Mar', value: 50 },
        { type: 'Apr', value: 70 },
    ];

    const config = {
        data,
        xField: 'type',
        yField: 'value',
        color: '#1890ff',
    };

    return <Column {...config} />;
};

export default BarChart;
