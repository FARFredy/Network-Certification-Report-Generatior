import React from 'react';
import { useForm } from 'react-hook-form';

const AuthRegister: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    // TODO: Implementar llamada a API para registro
    console.log(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl mb-4">Register</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            {...register('name', { required: true })}
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.name && <span className="text-red-500">Nombre requerido</span>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            {...register('email', { required: true })}
            type="email"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.email && <span className="text-red-500">Email requerido</span>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            {...register('password', { required: true })}
            type="password"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.password && <span className="text-red-500">Password requerido</span>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Confirm Password</label>
          <input
            {...register('confirmPassword', { required: true })}
            type="password"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.confirmPassword && <span className="text-red-500">Confirmar password requerido</span>}
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
      </form>
    </div>
  );
};

export default AuthRegister;