import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const MerchantHotels: React.FC = () => {
  return (
    <div>
      <Title level={3}>我的酒店</Title>
      {/* TODO: 酒店列表 */}
    </div>
  );
};

export default MerchantHotels;
