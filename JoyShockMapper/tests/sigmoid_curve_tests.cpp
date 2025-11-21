#include <catch2/catch_test_macros.hpp>
#include <catch2/catch_approx.hpp>
#include "SigmoidCurve.h"

using Catch::Approx;

// Model under test:
//
// float SigmoidSensitivity(float omega,
//                          float sMin, float sMax,
//                          float vMid, float width);
//
// Internally:
//   w = max(width, 1e-6)
//   z = (omega - vMid) / w
//   sigma = 1 / (1 + exp(-z))
//   S(omega) = sMin + (sMax - sMin) * sigma


// ---------------------------------------------------------
// 1. Basic shape / anchor tests
// ---------------------------------------------------------

TEST_CASE("SigmoidSensitivity at vMid returns midpoint between sMin and sMax") {
    float sMin = 0.5f;
    float sMax = 1.0f;
    float vMid = 20.0f;
    float width = 10.0f;

    float S = SigmoidSensitivity(vMid, sMin, sMax, vMid, width);
    float expected = (sMin + sMax) * 0.5f;

    REQUIRE(S == Approx(expected).margin(1e-6f));
}

TEST_CASE("SigmoidSensitivity approaches sMin and sMax far from vMid") {
    float sMin = 0.5f;
    float sMax = 1.0f;
    float vMid = 20.0f;
    float width = 5.0f;

    // Far below vMid: omega = vMid - 10 * width
    float omega_lo = vMid - 10.0f * width;
    float S_lo = SigmoidSensitivity(omega_lo, sMin, sMax, vMid, width);
    REQUIRE(S_lo >= sMin);
    REQUIRE(S_lo <= sMin + (sMax - sMin) * 0.01f); // very close to sMin

    // Far above vMid: omega = vMid + 10 * width
    float omega_hi = vMid + 10.0f * width;
    float S_hi = SigmoidSensitivity(omega_hi, sMin, sMax, vMid, width);
    REQUIRE(S_hi <= sMax);
    REQUIRE(S_hi >= sMax - (sMax - sMin) * 0.01f); // very close to sMax
}


// ---------------------------------------------------------
// 2. Range and monotonicity tests
// ---------------------------------------------------------

TEST_CASE("SigmoidSensitivity stays within [sMin, sMax]") {
    float sMin = 0.5f;
    float sMax = 1.0f;
    float vMid = 20.0f;
    float width = 8.0f;

    for (float omega = -40.0f; omega <= 100.0f; omega += 2.0f) {
        float S = SigmoidSensitivity(omega, sMin, sMax, vMid, width);
        REQUIRE(S >= Approx(sMin).margin(1e-6f));
        REQUIRE(S <= Approx(sMax).margin(1e-6f));
    }
}

TEST_CASE("SigmoidSensitivity is monotone increasing in omega") {
    float sMin = 0.5f;
    float sMax = 1.0f;
    float vMid = 20.0f;
    float width = 8.0f;

    float prev = SigmoidSensitivity(-40.0f, sMin, sMax, vMid, width);

    for (float omega = -40.0f; omega <= 100.0f; omega += 2.0f) {
        float cur = SigmoidSensitivity(omega, sMin, sMax, vMid, width);
        REQUIRE(cur >= Approx(prev).margin(1e-6f));
        prev = cur;
    }
}


// ---------------------------------------------------------
// 3. Symmetry around vMid
// ---------------------------------------------------------
//
// For the logistic σ and linear mapping, we have:
//   σ(-z) = 1 - σ(z)
//   S(ω) = sMin + Δ σ(z)
// so S(vMid - d) + S(vMid + d) = sMin + sMax exactly (up to FP error).

TEST_CASE("SigmoidSensitivity is symmetric around vMid in value") {
    float sMin = 0.5f;
    float sMax = 1.0f;
    float vMid = 20.0f;
    float width = 10.0f;

    float target_sum = sMin + sMax;

    for (float d : { 0.0f, 5.0f, 10.0f, 20.0f }) {
        float S_left  = SigmoidSensitivity(vMid - d, sMin, sMax, vMid, width);
        float S_right = SigmoidSensitivity(vMid + d, sMin, sMax, vMid, width);
        REQUIRE(S_left + S_right == Approx(target_sum).margin(1e-5f));
    }
}


// ---------------------------------------------------------
// 4. Width parameter behavior
// ---------------------------------------------------------

TEST_CASE("Larger width makes the transition gentler around vMid") {
    float sMin = 0.5f;
    float sMax = 1.0f;
    float vMid = 20.0f;

    float width_narrow = 5.0f;
    float width_wide   = 20.0f;

    // Look at deviation from midpoint at some offset
    float omega1 = vMid + 5.0f; // same distance from vMid for both widths

    float mid = (sMin + sMax) * 0.5f;

    float S_narrow = SigmoidSensitivity(omega1, sMin, sMax, vMid, width_narrow);
    float S_wide   = SigmoidSensitivity(omega1, sMin, sMax, vMid, width_wide);

    float dev_narrow = std::fabs(S_narrow - mid);
    float dev_wide   = std::fabs(S_wide   - mid);

    // Narrow width: sharper S-shape -> larger deviation at same distance
    REQUIRE(dev_narrow > dev_wide);
}


// ---------------------------------------------------------
// 5. Edge cases: width <= 0 (guard behavior)
// ---------------------------------------------------------

TEST_CASE("SigmoidSensitivity with non-positive width still stays within [sMin, sMax]") {
    float sMin = 0.5f;
    float sMax = 1.0f;
    float vMid = 20.0f;

    for (float width : {0.0f, -5.0f}) {
        for (float omega : {vMid - 1e-4f, vMid, vMid + 1e-4f}) {
            float S = SigmoidSensitivity(omega, sMin, sMax, vMid, width);
            REQUIRE(S >= Approx(sMin).margin(1e-6f));
            REQUIRE(S <= Approx(sMax).margin(1e-6f));
        }
    }
}

TEST_CASE("SigmoidSensitivity with very small width behaves like a jump at vMid") {
    float sMin = 0.5f;
    float sMax = 1.0f;
    float vMid = 20.0f;
    float width = 0.0f; // will be clamped internally to ~1e-6

    // Slightly below and above vMid: should be very close to sMin / sMax.
    float S_below = SigmoidSensitivity(vMid - 1e-4f, sMin, sMax, vMid, width);
    float S_above = SigmoidSensitivity(vMid + 1e-4f, sMin, sMax, vMid, width);

    REQUIRE(S_below == Approx(sMin).margin((sMax - sMin) * 1e-3f));
    REQUIRE(S_above == Approx(sMax).margin((sMax - sMin) * 1e-3f));
}
