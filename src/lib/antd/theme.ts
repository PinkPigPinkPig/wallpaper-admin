import { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#3437b3',
    colorLink: '#3437b3',
    fontSize: 16,
    wireframe: false,
  },
  components: {
    Button: {
      algorithm: true,
      controlHeightLG: 48,
      controlHeight: 40,
      controlHeightSM: 32,
      contentFontSize: 16,
      contentFontSizeLG: 18,
      contentLineHeight: 1.5,
      contentLineHeightLG: 1.4444444444444444,
    },
    Typography: {
      algorithm: true,
    },
    Menu: {
      itemHeight: 48,
    },
    Tabs: {
      cardBg: '#f5f5f5',
      cardGutter: 0,
      colorBorderSecondary: 'none',
      margin: 0,
      colorText: '#000000',
    },
    Segmented: {
      borderRadiusLG: 6,
    },
    InputNumber: {
      handleWidth: 0,
    },
  },
};

export default theme;
