import '../styles/tailwind.css';
import '../styles/icons.css';
import { AppProps } from "next/app";
import { SWRConfig } from 'swr'; //从HTTP请求中获取缓存数据获取
import Axios from 'axios';

import NavBar from '../components/NavBar';
import { AuthProvider } from '../context/auth';

import { useRouter } from 'next/router';
// 添加环境变量后需要重启项目
Axios.defaults.baseURL = 'https://sleepy-anchorage-83122.herokuapp.com' + '/api'; //默认URL
// Axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + '/api'; //默认URL
console.log(Axios.defaults.baseURL)
Axios.defaults.withCredentials = true;
//  { withCredentials: true });
// 允许传递cookie， 信任server
const fetcher = async (url: string) => {
  try {
    const res = await Axios.get(url)
    return res.data
  } catch (err) {
    throw err.response.data
  }
}
function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ['/register', '/login'];
  const authRoute = authRoutes.includes(pathname);
  return (
    <SWRConfig value={{
      fetcher,
      // 在10秒中内，会缓存这期间的数据
      dedupingInterval: 10000
    }}>
      <AuthProvider>
        {/* NavBar不在验证页面（登陆，注册）显示 */}
        {!authRoute && <NavBar />}
        <div className={authRoute? '': 'pt-12'}>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </SWRConfig>
  )
}

export default App;