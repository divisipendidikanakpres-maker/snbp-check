'use client';

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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-sm bg-white rounded-xl shadow-lg p-6'>
        <div className='text-center mb-6'>
          <h1 className='text-xl font-bold text-gray-900'>Daftar Akun</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Buat akun SNBP Rasional
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-3.5'>
          <div>
            <label className='block text-xs font-medium text-gray-700 mb-1.5'>
              Nama Lengkap
            </label>
            <input
              type='text'
              name='fullName'
              value={form.fullName}
              onChange={handleChange}
              placeholder='Masukkan nama lengkap'
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition'
              required
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-700 mb-1.5'>
              No. Telepon
            </label>
            <input
              type='tel'
              name='phone'
              value={form.phone}
              onChange={handleChange}
              placeholder='08xxxxxxxxxx'
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition'
              required
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-700 mb-1.5'>
              Email
            </label>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              placeholder='contoh@email.com'
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition'
              required
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-700 mb-1.5'>
              Password
            </label>
            <PasswordInput
              name='password'
              value={form.password}
              onChange={handleChange}
              placeholder='Minimal 8 karakter'
              minLength={8}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition'
              required
            />
          </div>

          {error && (
            <p className='text-xs text-red-500 text-center'>{error}</p>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 text-white py-2 text-sm rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60'
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className='text-center text-xs text-gray-500 mt-4'>
          Sudah punya akun?{' '}
          <Link
            href='/'
            className='text-blue-600 hover:text-blue-700 font-medium'
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}