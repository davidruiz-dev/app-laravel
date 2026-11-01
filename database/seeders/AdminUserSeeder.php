<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = config('admin.email');
        $password = config('admin.password');

        if (!$email || !$password) {
            throw new RuntimeException(
                'Faltan las credenciales del administrador.'
            );
        }
        
        User::firstOrCreate(
            ['email' => $email],
            [
                'name' => config('admin.name'),
                'email' => $email,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]
        );
    }
}
