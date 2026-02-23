import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { theme as antdTheme } from 'antd';
import { store } from './store';
import router from './router';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ConfigProvider
          locale={zhCN}
          theme={{
            algorithm: antdTheme.defaultAlgorithm,
            token: {
              colorPrimary: '#1f6feb',
              colorInfo: '#1f6feb',
              colorSuccess: '#1a9b7d',
              colorWarning: '#d9892f',
              colorError: '#d84f5f',
              borderRadius: 12,
              borderRadiusLG: 14,
              controlHeight: 38,
              fontSize: 14,
              fontFamily: '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
              colorBgLayout: '#f3f6fb',
            },
            components: {
              Button: {
                controlHeight: 38,
                borderRadius: 10,
              },
              Card: {
                borderRadiusLG: 14,
              },
              Table: {
                borderRadius: 12,
                headerBg: '#f7faff',
                headerColor: '#24324a',
              },
              Input: {
                borderRadius: 10,
              },
              Select: {
                borderRadius: 10,
              },
            },
          }}
        >
          <RouterProvider router={router} />
        </ConfigProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
