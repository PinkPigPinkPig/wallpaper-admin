"use client";

import Button from "antd/es/button/button";
import Card from "antd/es/card/Card";
import Form from "antd/es/form/Form";
import FormItem from "antd/es/form/FormItem";
import Input from "antd/es/input/Input";
import { message, Spin } from "antd";
import { useRouter } from "next/navigation";
import { menus } from "@/data/paths";
import { useAuth } from "@/hooks/useAuth";

interface SignInFormValues {
  username: string;
  password: string;
}

const Page = () => {
  const router = useRouter();
  const { login } = useAuth();
  
  const onSuccess = async () => {
    router.push(menus[0].key);
  };

  const onError = (error: Error) => {
    message.error(error.message || "Login failed");
  };

  const onFinish = async (values: SignInFormValues) => {
    try {
      await login(values.username, values.password);
      onSuccess();
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Spin spinning={false}>
      <div className="bg-amber-50 h-full w-full min-h-screen flex justify-center items-center !text-black">
        <Card
          title="Login"
          variant="borderless"
          style={{ width: 500 }}
        >
          <Form<SignInFormValues>
            layout="vertical"
            onFinish={onFinish}
          >
            <FormItem
              required
              label="Username"
              name="username"
              className="mb-4"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter your username",
                },
              ]}
            >
              <Input placeholder="Enter your username" size="large" />
            </FormItem>
            <FormItem
              required
              label="Password"
              name="password"
              className="mb-4"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter your password",
                },
              ]}
            >
              <Input
                type="password"
                placeholder="Enter your password"
                size="large"
              />
            </FormItem>
            <FormItem className="flex justify-end">
              <Button
                type="primary"
                htmlType="submit"
              >
                Login
              </Button>
            </FormItem>
          </Form>
        </Card>
      </div>
    </Spin>
  );
};

export default Page;
