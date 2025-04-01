import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AuthService from '../service/AuthService';
import { 
  Typography, 
  Spin, 
  Card, 
  Divider, 
  Alert, 
  Progress, 
  Tag, 
  Row, 
  Col, 
  Space, 
  List,
  Empty
} from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface Quiz {
  quizId: string;
  categoryId: string;
  name: string;
  description: string;
  quizStatus: number;
  createdAt: string;
  updatedAt: string;
}

interface QuizResult {
  memberResultId: string;
  quizName: string;
  score: number;
  quiz: Quiz;
}

const QuizResult: React.FC = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getScoreColor = (score: number): string => {
    if (score >= 300) return 'success';
    if (score >= 200) return 'processing';
    if (score >= 100) return 'warning';
    return 'error';
  };

  const getScoreTextColor = (score: number): string => {
    if (score >= 300) return '#52c41a'; // Ant Design success color
    if (score >= 200) return '#1890ff'; // Ant Design processing color
    if (score >= 100) return '#faad14'; // Ant Design warning color
    return '#f5222d'; // Ant Design error color
  };

  const getScoreCategory = (score: number): string => {
    if (score >= 300) return 'Xuất sắc';
    if (score >= 200) return 'Tốt';
    if (score >= 100) return 'Trung bình';
    return 'Cần cải thiện';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 300) return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    if (score >= 200) return <BarChartOutlined style={{ color: '#1890ff' }} />;
    if (score >= 100) return <QuestionCircleOutlined style={{ color: '#faad14' }} />;
    return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
  };

  const normalizeScore = (score: number): number => {
    // Assuming maximum score is 400 based on the sample data
    return (score / 400) * 100;
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const decodedToken = AuthService.getDecodedToken();
        
        if (!decodedToken || !decodedToken.UserId) {
          setError('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }
        
        const userId = decodedToken.UserId;
        console.log('Fetching results for user:', userId);
        
        const response = await axios.get(
          `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/MemberResult/Get_Member_Result_By_UserId?id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${AuthService.getToken()}`
            }
          }
        );
        
        console.log('API Response:', response.data);
        
        if (response.data) {
          // Sort by date (newest first) if quiz has updated/created date
          const sortedResults = [...response.data].sort((a, b) => {
            const dateA = new Date(a.quiz.updatedAt || a.quiz.createdAt);
            const dateB = new Date(b.quiz.updatedAt || b.quiz.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
          
          setResults(sortedResults);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Có lỗi xảy ra khi tải kết quả bài kiểm tra. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" />
        <Text style={{ marginLeft: 16, fontSize: 16 }}>
          Đang tải kết quả...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 800, margin: '24px auto' }}>
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={{ maxWidth: 800, margin: '48px auto', textAlign: 'center' }}>
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                <Text strong style={{ fontSize: 16 }}>
                  Chưa có kết quả bài kiểm tra
                </Text>
                <br />
                <Text type="secondary" style={{ marginTop: 8 }}>
                  Bạn chưa hoàn thành bất kỳ bài kiểm tra nào. Hãy thử làm một bài để xem kết quả tại đây.
                </Text>
              </span>
            }
          />
        </Card>
      </div>
    );
  }

  // Group results by quiz name
  const groupedResults: Record<string, QuizResult[]> = {};
  results.forEach(result => {
    if (!groupedResults[result.quizName]) {
      groupedResults[result.quizName] = [];
    }
    groupedResults[result.quizName].push(result);
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>Kết Quả Bài Kiểm Tra</Title>
      
      <Divider />
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {Object.entries(groupedResults).map(([quizName, quizResults], index) => {
          // Sort attempts by date (most recent first)
          const sortedAttempts = [...quizResults].sort((a, b) => {
            const dateA = new Date(a.quiz.updatedAt || a.quiz.createdAt);
            const dateB = new Date(b.quiz.updatedAt || b.quiz.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
          
          const latestAttempt = sortedAttempts[0];
          const highestScore = Math.max(...sortedAttempts.map(r => r.score));
          const latestScore = latestAttempt.score;
          
          return (
            <Card 
              key={index}
              title={
                <div>
                  <Title level={4} style={{ margin: 0 }}>{quizName}</Title>
                  <Paragraph type="secondary">{latestAttempt.quiz.description}</Paragraph>
                </div>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <div>
                    <Title level={5}>Lần làm gần nhất</Title>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                      {getScoreIcon(latestScore)}
                      <Title level={3} style={{ 
                        margin: '0 0 0 8px', 
                        color: getScoreTextColor(latestScore)
                      }}>
                        {latestScore} điểm
                      </Title>
                    </div>
                    
                    <Tag color={getScoreColor(latestScore)} style={{ marginBottom: 16 }}>
                      {getScoreCategory(latestScore)}
                    </Tag>
                    
                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text type="secondary">Tiến độ</Text>
                        <Text strong>{normalizeScore(latestScore).toFixed(0)}%</Text>
                      </div>
                      <Progress
                        percent={normalizeScore(latestScore)}
                        status={getScoreColor(latestScore) as "success" | "exception" | "active" | "normal" | undefined}
                        strokeColor={getScoreTextColor(latestScore)}
                        showInfo={false}
                        trailColor="#f0f0f0"
                      />
                    </div>
                  </div>
                </Col>
                
                <Col xs={24} md={12}>
                  <div>
                    <Title level={5}>Tất cả các lần làm ({sortedAttempts.length})</Title>
                    <Card 
                      size="small" 
                      bodyStyle={{ 
                        maxHeight: 200, 
                        overflow: 'auto', 
                        padding: 0 
                      }}
                    >
                      <List
                        dataSource={sortedAttempts}
                        renderItem={(attempt, attemptIndex) => {
                          const attemptDate = new Date(attempt.quiz.updatedAt || attempt.quiz.createdAt);
                          return (
                            <List.Item 
                              style={{ 
                                padding: '12px 16px',
                                backgroundColor: attemptIndex === 0 ? '#fafafa' : 'transparent'
                              }}
                            >
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                width: '100%'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  {getScoreIcon(attempt.score)}
                                  <Text 
                                    style={{ 
                                      marginLeft: 8, 
                                      fontWeight: attemptIndex === 0 ? 'bold' : 'normal' 
                                    }}
                                  >
                                    {attempt.score} điểm
                                  </Text>
                                </div>
                                <Text type="secondary">
                                  {attemptDate.toLocaleDateString('vi-VN')}
                                </Text>
                              </div>
                            </List.Item>
                          );
                        }}
                      />
                    </Card>
                    
                    <div style={{ 
                      marginTop: 16, 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Text>Điểm cao nhất:</Text>
                      <Text strong style={{ color: getScoreTextColor(highestScore) }}>
                        {highestScore} điểm
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          );
        })}
      </Space>
    </div>
  );
};

export default QuizResult;