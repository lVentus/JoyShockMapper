#pragma once

#include <cstdint>
#include <string>

struct TelemetrySample
{
	uint64_t timestampMs = 0;
	float omega = 0.0f;
	float normalized = 0.0f;
	float normalizedPostCurve = 0.0f;
	float sensX = 0.0f;
	float sensY = 0.0f;
	float minThreshold = 0.0f;
	float maxThreshold = 0.0f;
	float sMinX = 0.0f;
	float sMaxX = 0.0f;
	float sMinY = 0.0f;
	float sMaxY = 0.0f;
	std::string curve = "LINEAR";
	std::string paramsJson = "{}";
};

namespace Telemetry
{

constexpr int kProtoVersion = 1;
constexpr int kDefaultPort = 8974;
constexpr int kMaxRateHz = 120;

void Configure(bool enabled, uint16_t port);
void Shutdown();
void MaybeSend(const TelemetrySample &sample);

} // namespace Telemetry
