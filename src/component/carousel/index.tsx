import React from 'react';
import { Carousel } from 'antd';

// Define styles for the carousel images
const contentStyle: React.CSSProperties = {
    height: '800px', // Increased height for better image display
    width: '100%',
    objectFit: 'cover', // Ensures images scale properly
};

const App: React.FC = () => (
    <Carousel autoplay>
        <div>
            <img
                src="https://ideogram.ai/assets/image/lossless/response/8OGm1LHMRpuAP_xxE6FHzg"
                alt="Slide 1"
                style={contentStyle}
            />
        </div>
        <div>
            <img
                src="https://ideogram.ai/assets/image/lossless/response/CH8sjnKAQmCPLxqlmyNLkg"
                alt="Slide 2"
                style={contentStyle}
            />
        </div>
        <div>
            <img
                src="https://ideogram.ai/assets/image/lossless/response/YPGEZAuHSTStyQ6mI2yu7Q"
                alt="Slide 3"
                style={contentStyle}
            />
        </div>
        <div>
            <img
                src="https://ideogram.ai/assets/image/lossless/response/fM5huzi-TiWPju0IpmieWw"
                alt="Slide 4"
                style={contentStyle}
            />
        </div>
    </Carousel>
);

export default App;