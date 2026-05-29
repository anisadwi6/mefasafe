<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Reminder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'referral_code',
        'profile_picture',
    ];

    public function setProfilePictureAttribute(?string $value): void
    {
        if (! $value) {
            $this->attributes['profile_picture'] = null;

            return;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            $path = parse_url($value, PHP_URL_PATH) ?: '';
            $this->attributes['profile_picture'] = ltrim($path, '/');

            return;
        }

        $this->attributes['profile_picture'] = ltrim($value, '/');
    }

    public function getProfilePictureAttribute(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            $path = parse_url($value, PHP_URL_PATH) ?: '';

            return $this->buildPublicUrl($path);
        }

        return $this->buildPublicUrl('/' . ltrim($value, '/'));
    }

    private function buildPublicUrl(string $path): string
    {
        $path = '/' . ltrim($path, '/');

        if (app()->runningInConsole() && ! app()->runningUnitTests()) {
            return rtrim(config('app.url'), '/') . $path;
        }

        return request()->getSchemeAndHttpHost() . $path;
    }

    public function referralsMade(): HasMany
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referralReceived(): HasOne
    {
        return $this->hasOne(Referral::class, 'referred_user_id');
    }

    public function discountCoupons(): HasMany
    {
        return $this->hasMany(DiscountCoupon::class);
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    public function insurancePolicies(): HasMany
    {
        return $this->hasMany(InsurancePolicy::class);
    }

    public function claims(): HasMany
    {
        return $this->hasMany(Claim::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function hospitalRegistrations(): HasMany
    {
        return $this->hasMany(HospitalRegistration::class);
    }

    public function doctorConsultations(): HasMany
    {
        return $this->hasMany(DoctorConsultation::class);
    }

    public function feedbacks(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class);
    }
}
