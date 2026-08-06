export const AUTH_API_BASE =  "https://api.figital3d.com";
export const CHAT_API_BASE =  "https://chat.figital3d.com";


export const AUTH_API_ENDPOINTS = {
  REQUEST_OTP: `${AUTH_API_BASE}/auth/request-otp`,
  VERIFY_OTP: `${AUTH_API_BASE}/auth/verify-otp`,
  REFRESH: `${AUTH_API_BASE}/auth/refresh`,
  LOGOUT: `${AUTH_API_BASE}/auth/logout`,
  USER_PROFILE: `${AUTH_API_BASE}/users/me`,
  SHIPMENT_METHODS: `${AUTH_API_BASE}/shipment-methods`,
  USER_SET_FIELD: (field:string) => `${AUTH_API_BASE}/users/set/${field}`,
  USER_ADDRESSES: `${AUTH_API_BASE}/users/addresses`,
  USER_ADDRESS: (addressId:string) => `${AUTH_API_BASE}/users/addresses/${addressId}`,
  TRANSACTION_REQUEST: `${AUTH_API_BASE}/transactions/request`,
  TRANSACTION_REQUEST_DUMMY: `${AUTH_API_BASE}/transactions/request-dummy`,
  TRANSACTION_VERIFY: `${AUTH_API_BASE}/transactions/verify`,
  ORDERS_ME: `${AUTH_API_BASE}/orders/me`,
};

export const CHAT_API_ENDPOINTS = {
  MESSAGES:`${CHAT_API_BASE}/messages`,
  ROOMS:`${CHAT_API_BASE}/rooms`,
  ROOM: (roomId:string) => `${CHAT_API_BASE}/rooms/${(roomId)}`,
  CREATE_ROOMS:`${CHAT_API_BASE}/rooms/create`,
  USER:`${CHAT_API_BASE}/user`,
  VAPID_PUBLIC_KEY: `${CHAT_API_BASE}/notifications/vapid-public-key`,
  NOTIFICATION_SUBSCRIBE: `${CHAT_API_BASE}/notifications/subscribe`,

}