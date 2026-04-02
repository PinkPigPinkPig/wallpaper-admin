"use client";

import { useState } from "react";
import { Button, Card, Divider, Flex, Form, Input, message, Typography } from "antd";
import { useRouter } from "next/navigation";
import { LoginOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { menus } from "@/data/paths";
import { useAuth } from "@/hooks/useAuth";

const { Title, Text } = Typography;

interface SignInFormValues {
  username: string;
  password: string;
}

const Page = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: SignInFormValues) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      router.push(menus[0].key);
    } catch (error) {
      const err = error as { message?: string };
      messageApi.error(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8f9ff 0%, #eef0ff 100%)",
      }}
    >
      {contextHolder}
      <Card
        style={{
          width: 440,
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(52, 55, 179, 0.12)",
          border: "none",
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Flex vertical align="center" gap={8} style={{ padding: "32px 32px 24px" }}>
          <Flex
            align="center"
            justify="center"
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #3437B3 0%, #5a5fd4 100%)",
              boxShadow: "0 4px 16px rgba(52, 55, 179, 0.3)",
            }}
          >
            <SafetyCertificateOutlined style={{ fontSize: 28, color: "#fff" }} />
          </Flex>
          <Title level={3} style={{ margin: 0, color: "#1a1a2e" }}>Wallpaper Admin</Title>
          <Text type="secondary">Sign in to manage your wallpaper content</Text>
        </Flex>

        <Divider style={{ margin: 0 }} />

        <div style={{ padding: "24px 32px 32px" }}>
          <Form layout="vertical" onFinish={onFinish} size="large" requiredMark="optional">
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: "Please enter your username" }]}
            >
              <Input
                prefix={<Text type="secondary">@</Text>}
                placeholder="Enter your username"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                placeholder="Enter your password"
                autoComplete="current-password"
                iconRender={(visible) =>
                  visible ? <Text type="secondary">Hide</Text> : <Text type="secondary">Show</Text>
                }
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<LoginOutlined />}
                style={{ width: "100%", height: 44 }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default Page;
