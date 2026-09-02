'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { ApiError } from '@/hooks/useApi';
import { PasswordInput } from '@/components/password-input';

export default function LoginPage() {
  const router = useRouter();
  const { login, me } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    me()
      .then(({ user }) => {
        router.replace(user.role === 'ADMIN' ? '/admin/akun' : '/beranda');
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex' style={{ background: '#F8FAFA' }}>
      {/* Left panel — brand */}
      <div
        className='hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden'
        style={{ background: 'linear-gradient(145deg, #02747A 0%, #03989E 60%, #0fb8bf 100%)' }}
      >
        {/* decorative circles */}
        <div className='absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10' style={{ background: '#fff' }} />
        <div className='absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-10' style={{ background: '#fff' }} />
        <div className='relative z-10 text-center text-white'>
          <Image src='/logo.png' alt='Logo SNBP' width={120} height={120} className='mx-auto mb-6 drop-shadow-lg' />
          <h1 className='text-4xl font-bold mb-3'>Rasionalisasi SNBP</h1>
          <p className='text-lg opacity-80 max-w-xs mx-auto'>
            Bandingkan nilai rapor kamu dengan estimasi nilai minimum SNBP setiap jurusan.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className='flex-1 flex items-center justify-center p-6'>
        <div className='w-full max-w-md'>
          {/* Logo for mobile */}
          <div className='flex flex-col items-center mb-8 lg:hidden'>
            <Image src='/logo.png' alt='Logo SNBP' width={72} height={72} className='mb-3' />
            <h1 className='text-2xl font-bold' style={{ color: '#02747A' }}>Rasionalisasi SNBP</h1>
          </div>

          <div className='bg-white rounded-2xl shadow-md p-8 border' style={{ borderColor: '#e0eded' }}>
            <h2 className='text-2xl font-bold mb-1' style={{ color: '#02747A' }}>Masuk</h2>
            <p className='text-sm mb-6' style={{ color: '#5a7a7a' }}>Silakan masuk ke akun Anda</p>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1.5' style={{ color: '#2d5a5a' }}>Email</label>
                <input
                  type='email'
                  name='email'
                  value={form.email}
                  onChange={handleChange}
                  placeholder='contoh@email.com'
                  className='w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition'
                  style={{ borderColor: '#c0d8d8', background: '#F8FAFA' }}
                  onFocus={e => { e.target.style.borderColor = '#03989E'; e.target.style.boxShadow = '0 0 0 3px rgba(3,152,158,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#c0d8d8'; e.target.style.boxShadow = 'none'; }}
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1.5' style={{ color: '#2d5a5a' }}>Password</label>
                <PasswordInput
                  name='password'
                  value={form.password}
                  onChange={handleChange}
                  placeholder='Masukkan password'
                  className='w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition'
                  style={{ borderColor: '#c0d8d8', background: '#F8FAFA' } as React.CSSProperties}
                  required
                />
              </div>

              {error && <p className='text-sm text-red-500 text-center'>{error}</p>}

              <button
                type='submit'
                disabled={loading}
                className='w-full py-2.5 rounded-xl font-semibold text-white transition-all duration-200 mt-2'
                style={{ background: loading ? '#7ac8cb' : '#03989E' }}
                onMouseEnter={e => !loading && ((e.target as HTMLElement).style.background = '#02747A')}
                onMouseLeave={e => !loading && ((e.target as HTMLElement).style.background = '#03989E')}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <p className='text-center text-sm mt-5' style={{ color: '#5a7a7a' }}>
              Belum punya akun?{' '}
              <Link href='/register' className='font-semibold' style={{ color: '#03989E' }}>
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}