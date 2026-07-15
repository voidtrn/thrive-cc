// Copyright StickmanImpact Project.

#include "UIJuiceLibrary.h"

float UUIJuiceLibrary::Ease(EUIEase Curve, float Alpha)
{
	const float T = FMath::Clamp(Alpha, 0.f, 1.f);
	switch (Curve)
	{
		case EUIEase::SmoothStep:
			return T * T * (3.f - 2.f * T);

		case EUIEase::EaseOutBack:
		{
			const float C1 = 1.70158f;
			const float C3 = C1 + 1.f;
			const float Inv = T - 1.f;
			return 1.f + C3 * Inv * Inv * Inv + C1 * Inv * Inv;
		}

		case EUIEase::EaseOutElastic:
		{
			if (T <= 0.f) return 0.f;
			if (T >= 1.f) return 1.f;
			const float C4 = (2.f * PI) / 3.f;
			return FMath::Pow(2.f, -10.f * T) * FMath::Sin((T * 10.f - 0.75f) * C4) + 1.f;
		}

		case EUIEase::EaseInCubic:
			return T * T * T;

		case EUIEase::EaseOutCubic:
		{
			const float Inv = 1.f - T;
			return 1.f - Inv * Inv * Inv;
		}

		case EUIEase::Linear:
		default:
			return T;
	}
}

float UUIJuiceLibrary::EaseFloat(EUIEase Curve, float A, float B, float Alpha)
{
	return A + (B - A) * Ease(Curve, Alpha);
}

FVector2D UUIJuiceLibrary::PopScale(float Alpha, float StartScale, float EndScale)
{
	const float Scale = EaseFloat(EUIEase::EaseOutBack, StartScale, EndScale, Alpha);
	return FVector2D(Scale, Scale);
}

float UUIJuiceLibrary::SpringInterp(float Current, float Target, float& Velocity,
	float DeltaTime, float Stiffness, float DampingRatio)
{
	if (DeltaTime <= 0.f)
	{
		return Current;
	}

	// Standard damped-spring integration (semi-implicit Euler).
	const float AngularFreq = Stiffness;
	const float Damping = 2.f * DampingRatio * AngularFreq;
	const float Accel = (Target - Current) * (AngularFreq * AngularFreq) - Velocity * Damping;
	Velocity += Accel * DeltaTime;
	return Current + Velocity * DeltaTime;
}

FVector2D UUIJuiceLibrary::DecayingShake(float Time, float Duration, float Magnitude, float Frequency)
{
	if (Time >= Duration || Duration <= 0.f)
	{
		return FVector2D::ZeroVector;
	}
	const float Decay = 1.f - (Time / Duration);
	const float Offset = FMath::Sin(Time * Frequency) * Magnitude * Decay;
	return FVector2D(Offset, Offset * 0.5f);
}
