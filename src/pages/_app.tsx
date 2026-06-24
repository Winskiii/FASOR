import type { AppProps } from 'next/app'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import '../styles/globals.css'
import { ReactElement, ReactNode } from 'react'
import { NextPage } from 'next'
import axios from 'axios'

// GLOBAL AXIOS MOCK FOR FE SAJA
axios.interceptors.request.use((config) => {
  return Promise.reject({ isMock: true, config })
})
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.isMock) {
      const url = error.config.url || ''
      const method = (error.config.method || '').toLowerCase()
      console.log('Mocked Axios Request:', method.toUpperCase(), url)
      
      let data: any = { status: 'success', data: [] }
      
      if (url.includes('/auth/user')) {
        if (typeof window !== 'undefined' && sessionStorage.getItem('fasor_logged_in') === 'true') {
          data = { status: 'success', data: { name: 'Daffa Diandra Rizky', nama: 'Daffa Diandra Rizky', email: 'kiki@gmail.com', phone: '085708049979', no_telp: '085708049979', role: sessionStorage.getItem('fasor_admin_logged_in') === 'true' ? 'admin' : 'user' } }
        } else {
          return Promise.reject({ response: { status: 401 } })
        }
      } else if (url.includes('/reschedule-requests')) {
        data = { status: 'success', data: [
          {
            id: '1',
            kodeReschedule: 'RSC-001',
            kodeReservasi: 'FSRABCD1',
            namaPemesan: 'Daffa Diandra Rizky',
            jadwalBaru: '2026-06-26 15:00 - 16:00',
            status: 'pending'
          }
        ] }
      } else if (url.includes('/auth/profile-external') || url.includes('/auth/password-external') || url.includes('/auth/me') || url.includes('reschedule') || url.includes('approve') || url.includes('confirm')) {
        data = { status: 'success', message: 'Operasi berhasil.' }
      } else if (url.endsWith('/reservasi') || url.includes('/reservasi?type=')) {
        data = {
          status: 'success',
          data: {
            stats: { total: 2, waiting_verification: 1, waiting_payment: 0, approved: 1, canceled: 0 },
            changes: { total: 2, waiting_verification: 1, waiting_payment: 0, approved: 1, canceled: 0 },
            orders: [
              { kode: 'FSR-001', tanggal: '2026-06-20', fasilitas: 'GOR Bulutangkis ITS', atas_nama: 'Daffa Diandra Rizky', harga: 150000, status: 'Approved', created_at: '2026-06-19T10:00:00Z' },
              { kode: 'FSR-002', tanggal: '2026-06-21', fasilitas: 'Lapangan Futsal Outdoor', atas_nama: 'John Doe', harga: 85000, status: 'WaitingVerification', created_at: '2026-06-20T10:00:00Z' }
            ]
          }
        }
      } else if (url.includes('/reservasi/user') || url.includes('/reservasi/all')) {
        data = { 
          status: 'success', 
          data: {
            data: [
              { id_reservasi: '1', kode_booking: 'FSR-001', id_fasilitas: 'f1', tanggal_main: '2026-06-20', total_harga: 150000, status: 'paid', fasilitas: { nama: 'GOR Badminton' }, nama_pemesan: 'Daffa Diandra Rizky', email_pemesan: 'kiki@gmail.com', sesi_list: [{ jam_mulai: '10:00:00', jam_selesai: '11:00:00' }] },
              { id_reservasi: '2', kode_booking: 'FSR-002', id_fasilitas: 'f2', tanggal_main: '2026-06-21', total_harga: 85000, status: 'paid', fasilitas: { nama: 'Lapangan Futsal Outdoor' }, nama_pemesan: 'Daffa Diandra Rizky', email_pemesan: 'kiki@gmail.com', sesi_list: [{ jam_mulai: '08:00:00', jam_selesai: '09:00:00' }] }
            ]
          } 
        }
      } else if (url.includes('/fasilitas/reservasi') && method === 'post' && !url.includes('reschedule') && !url.includes('approve') && !url.includes('confirm')) {
        let reqData: any = {}
        if (error.config.data) {
          try { reqData = JSON.parse(error.config.data) } catch (e) {}
        }
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let rnd = ''
        for (let i = 0; i < 5; i++) rnd += chars.charAt(Math.floor(Math.random() * chars.length))
        const generatedCode = 'FSR' + rnd
        
        const newBooking = {
          booking_code: generatedCode,
          fasilitas: { id_fasilitas: reqData.id_fasilitas || '123', nama: reqData.lapangan || 'GOR Badminton' },
          lapangan: reqData.lapangan || 'Lapangan Utama',
          tgl_reservasi: reqData.jam_mulai ? reqData.jam_mulai.split('T')[0] : '2026-06-25',
          jam_mulai: reqData.jam_mulai || '08:00',
          jam_selesai: reqData.jam_selesai || '09:00',
          harga_per_unit: 150000,
          total_harga: 150000,
          satuan: 'Jam',
          durasi: 1,
          pemesan: { nama: reqData.nama_pemesan || 'Daffa Diandra Rizky', email: reqData.email_pemesan || 'kiki@gmail.com', no_telp: reqData.no_telp_pemesan || '085708049979' },
          status: 'menunggu',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('fasor_mock_' + generatedCode, JSON.stringify(newBooking))
        }
        data = { status: 'success', data: { kode_booking: generatedCode } }
      } else if (url.includes('/fasilitas/reservasi/') && method === 'get') {
        const code = url.split('/').pop() || 'ABCDEF'
        let bookingData = {
          booking_code: code,
          fasilitas: { id_fasilitas: '123', nama: 'GOR Badminton' },
          lapangan: 'Lapangan Utama',
          tgl_reservasi: '2026-06-25',
          jam_mulai: '10:00',
          jam_selesai: '11:00',
          harga_per_unit: 150000,
          total_harga: 150000,
          satuan: 'Jam',
          durasi: 1,
          pemesan: { nama: 'Daffa Diandra Rizky', email: 'kiki@gmail.com', no_telp: '085708049979' },
          status: 'menunggu',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        }
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('fasor_mock_' + code)
          if (saved) bookingData = JSON.parse(saved)
        }
        data = { status: 'success', data: bookingData }
      } else if (url.includes('/reservasi/') && url.includes('detail')) {
        data = { status: 'success', data: { id_reservasi: '1', kode_booking: 'FSR-001', status: 'paid', total_harga: 150000, fasilitas: { nama: 'GOR Badminton' }, pemesan: { nama: 'Daffa Diandra Rizky' }, sesi_list: [{ jam_mulai: '10:00:00', jam_selesai: '11:00:00' }] } }
      } else if (url.includes('/fasilitas')) {
        data = { status: 'success', data: [
          { id_fasilitas: 'f1', nama: 'GOR Futsal Indoor' },
          { id_fasilitas: 'f2', nama: 'Lapangan Futsal Outdoor' },
          { id_fasilitas: 'f3', nama: 'Lapangan Basket Semi Indoor' },
          { id_fasilitas: 'f4', nama: 'Lapangan Basket Outdoor' },
          { id_fasilitas: 'f5', nama: 'GOR Badminton' },
          { id_fasilitas: 'f6', nama: 'Lapangan Tenis' },
          { id_fasilitas: 'f7', nama: 'Stadion Sepak Bola' },
          { id_fasilitas: 'f8', nama: 'Mini Soccer' },
          { id_fasilitas: 'f9', nama: 'Lapangan Voli Outdoor' }
        ] }
      }
      
      return Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config: error.config })
    }
    return Promise.reject(error)
  }
)

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const theme = extendTheme({
  fonts: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" }
})

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)
  return (
    <ChakraProvider theme={theme}>
      {getLayout(<Component {...pageProps} />)}
    </ChakraProvider>
  )
}
