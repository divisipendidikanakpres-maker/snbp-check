'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { ApiError } from '@/hooks/useApi';
import { PasswordInput } from '@/components/password-input';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(form);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4' style={{ background: '#F8FAFA' }}>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-md p-8 border' style={{ borderColor: '#e0eded' }}>
        <div className='flex flex-col items-center mb-6 text-center'>
          <Image src='/logo.png' alt='Logo SNBP' width={64} height={64} className='mb-2' />
          <h1 className='text-2xl font-bold' style={{ color: '#02747A' }}>Daftar Akun Baru</h1>
          <p className='text-sm mt-1' style={{ color: '#5a7a7a' }}>Buat akun Rasionalisasi SNBP</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-3.5'>
          <div>
            <label className='block text-xs font-medium mb-1' style={{ color: '#2d5a5a' }}>Nama Lengkap</label>
            <input
              type='text'
              name='fullName'
              value={form.fullName}
              onChange={handleChange}
              placeholder='Masukkan nama lengkap'
              className='w-full px-3.5 py-2 text-sm border rounded-xl outline-none transition'
              style={{ borderColor: '#c0d8d8', background: '#F8FAFA' }}
              required
            />
          </div>

          <div>
            <label className='block text-xs font-medium mb-1' style={{ color: '#2d5a5a' }}>No. Telepon</label>
            <input
              type='tel'
              name='phone'
              value={form.phone}
              onChange={handleChange}
              placeholder='08xxxxxxxxxx'
              className='w-full px-3.5 py-2 text-sm border rounded-xl outline-none transition'
              style={{ borderColor: '#c0d8d8', background: '#F8FAFA' }}
              required
            />
          </div>

          <div>
            <label className='block text-xs font-medium mb-1' style={{ color: '#2d5a5a' }}>Email</label>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              placeholder='contoh@email.com'
              className='w-full px-3.5 py-2 text-sm border rounded-xl outline-none transition'
              style={{ borderColor: '#c0d8d8', background: '#F8FAFA' }}
              required
            />
          </div>

          <div>
            <label className='block text-xs font-medium mb-1' style={{ color: '#2d5a5a' }}>Password</label>
            <PasswordInput
              name='password'
              value={form.password}
              onChange={handleChange}
              placeholder='Minimal 8 karakter'
              minLength={8}
              className='w-full px-3.5 py-2 text-sm border rounded-xl outline-none transition'
              style={{ borderColor: '#c0d8d8', background: '#F8FAFA' } as React.CSSProperties}
              required
            />
          </div>

          {error && <p className='text-xs text-red-500 text-center'>{error}</p>}

          <button
            type='submit'
            disabled={loading}
            className='w-full py-2.5 text-sm rounded-xl font-semibold text-white transition mt-2'
            style={{ background: loading ? '#7ac8cb' : '#03989E' }}
            onMouseEnter={e => !loading && ((e.target as HTMLElement).style.background = '#02747A')}
            onMouseLeave={e => !loading && ((e.target as HTMLElement).style.background = '#03989E')}
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className='text-center text-sm mt-5' style={{ color: '#5a7a7a' }}>
          Sudah punya akun?{' '}
          <Link href='/' className='font-semibold' style={{ color: '#03989E' }}>
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}