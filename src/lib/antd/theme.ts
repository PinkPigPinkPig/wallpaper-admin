import { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#3437b3',
    colorLink: '#3437b3',
    fontSize: 16,
    wireframe: false,
    borderRadius: 8,
    borderRadiusLG: 12,
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
      borderRadius: 8,
    },
    Typography: {
      algorithm: true,
    },
    Table: {
      headerBg: '#fafafa',
      rowHoverBg: '#f5f5f5',
      headerBorderRadius: 0,
      cellPaddingBlock: 16,
      cellPaddingInline: 16,
    },
    Card: {
      borderRadiusLG: 12,
      paddingLG: 24,
    },
    Modal: {
      borderRadiusLG: 12,
    },
    Form: {
      itemMarginBottom: 8,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Upload: {
      borderRadius: 8,
    },
    Menu: {
      itemHeight: 48,
      itemBorderRadius: 8,
      itemSelectedBg: 'rgba(52, 55, 179, 0.1)',
      itemSelectedColor: '#3437B3',
      itemHoverBg: 'rgba(52, 55, 179, 0.05)',
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
    Dropdown: {
      borderRadiusLG: 8,
      paddingBlock: 8,
    },
    Message: {
      borderRadiusLG: 8,
    },
  },
};

export default theme;
