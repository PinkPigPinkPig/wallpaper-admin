'use client';

import Button from 'antd/es/button/button';
import Card from 'antd/es/card/Card';
import Form from 'antd/es/form/Form';
import FormItem from 'antd/es/form/FormItem';
import Input from 'antd/es/input/Input';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface SignInFormValues {
  username: string;
  password: string;
}

const Page = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const onFinish = async (values: SignInFormValues) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
    } catch {
      // Error is already handled in the useAuth hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-amber-50 h-full w-full min-h-screen flex justify-center items-center !text-black'>
      <Card title='Login' variant='borderless' style={{ width: 500 }}>
        <Form<SignInFormValues> layout='vertical' onFinish={onFinish}>
          <FormItem
            required
            label='Username'
            name='username'
            className='mb-4'
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input placeholder='Enter your username' />
          </FormItem>
          <FormItem
            required
            label='Password'
            name='password'
            className='mb-4'
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input type="password" placeholder='Enter your password' />
          </FormItem>
          <FormItem className='flex justify-end'>
            <Button type='primary' htmlType='submit' loading={loading}>
              Login
            </Button>
          </FormItem>
        </Form>
      </Card>
    </div>
  );
};

export default Page;
