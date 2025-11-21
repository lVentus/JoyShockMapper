#include "SigmoidCurve.h"
#include <cmath>

float SigmoidSensitivity(float omega, float sMin, float sMax, float vMid, float width)
{
    // Prevent division by zero; extremely small width makes a near-step.
    const float w = width > 0.0f ? width : 1e-6f;
    const float z = (omega - vMid) / w;
    const float sigma = 1.0f / (1.0f + std::exp(-z));
    return sMin + (sMax - sMin) * sigma;
}
