import { Button, Layout, Menu, theme } from "antd";
import { useEffect, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Link, Outlet } from "react-router";
import { GrTest } from "react-icons/gr";
import { BiHome } from "react-icons/bi";
import { TbBrandStocktwits } from "react-icons/tb";

const menu = [
  {
    icon: <BiHome />,
    label: <Link to={"/home"}>Home</Link>,
  },
  {
    label: <Link to={"/backtest"}>Backtest</Link>,
    icon: <GrTest />,
  },
  {
    label: <Link to={"/predict"}>Predict</Link>,
    icon: <TbBrandStocktwits />,
  },
];

export const LayoutRoot: React.FC = () => {
  const { Header, Sider, Content } = Layout;
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"

          items={menu.map((item, index) => ({
            ...item,
            key: index,
          }))}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
