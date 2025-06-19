import service from '@/utils/http'

export const Login = (data) => service.post('/user/login', data)
export const Register = (data) => service.post('/user/register', data)
export const Update = (data) => service.put('/user/update', data)
export const Get = () => service.get('/user/get')
