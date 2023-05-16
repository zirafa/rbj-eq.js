# rbj-eq.js
A simple javascript implementation of Robert Bristow-Johnson's EQ based on his [Audio EQ Cookbook](https://webaudio.github.io/Audio-EQ-Cookbook/Audio-EQ-Cookbook.txt)

https://www.w3.org/TR/audio-eq-cookbook/

## Usage
1) Use the ```calcFilterCoefficients``` function to generate filter coefficients for a desired filter, based on q OR bandwidth. If a value for bandwidth is passed in, the q argument is ignored.

2) Use the ```filterGain``` function to get the gain in dB for a given frequency for a filter (magnitude response)


