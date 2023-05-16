/**
 * RBJ Parametric EQ
 * https://webaudio.github.io/Audio-EQ-Cookbook/Audio-EQ-Cookbook.txt
 */
 
let samplerate = 44100.0;
let A, w0, cosw0,sinw0,alpha, sqrtA;
let b0,b1,b2,a0,a1,a2;
let log2 = Math.log(2.0);

// Calculate filter coefficients
function calcFilterCoefficients(type, frequency, dBGain = 0.0, q = 2.0, bandwidth = null) {
  A = Math.pow(10.0, dBGain / 40.0);
  w0 = (2.0 * Math.PI * frequency) / samplerate;
  cosw0 = Math.cos(w0);
  sinw0 = Math.sin(w0);
	sqrtA = Math.sqrt(A);
	
	// If bandwidth is passed in, use it in our calculations instead of q
  if(bandwidth !== null && bandwidth !== undefined) {
		alpha = sinw0 * Math.sinh(log2 / 2.0 * bandwidth * (w0/sinw0) );
  }		
	else {
  	alpha = sinw0 / (2 * q);
  }
	
  switch(type) {
	  case "peaking":
		  b0 = 1.0 + alpha * A;
		  b1 = -2.0 * cosw0;
		  b2 = 1.0 - alpha * A;
		  a0 = 1.0 + alpha / A;
		  a1 = -2.0 * cosw0;
		  a2 = 1.0 - alpha / A;		
		  break;
	  case "lowshelf":
      b0 =   A * ((A+1) - (A-1) * cosw0 + 2 * sqrtA * alpha);
      b1 =  2.0 * A * ((A-1) - (A+1) * cosw0);
      b2 =   A * ((A+1) - (A-1) * cosw0 - 2 * sqrtA * alpha);
      a0 =        (A+1) + (A-1) * cosw0 + 2 * sqrtA * alpha;
      a1 =  -2.0 * ((A-1) + (A+1) * cosw0);
      a2 =        (A+1) + (A-1) * cosw0 - 2 * sqrtA * alpha;
		  break;	
	  case "highshelf":
      b0 =    A * ((A+1) + (A-1) * cosw0 + 2 * sqrtA * alpha);
      b1 = -2.0 * A * ((A-1) + (A+1) * cosw0);
      b2 =    A * ((A+1) + (A-1) * cosw0 - 2 * sqrtA * alpha);
      a0 =        (A+1) - (A-1) * cosw0 + 2 * sqrtA * alpha;
      a1 =    2.0 * ((A-1) - (A+1) * cosw0);
      a2 =        (A+1) - (A-1) * cosw0 - 2 * sqrtA * alpha;
			break;
		case "notch":
      b0 =   1;
      b1 =  -2.0 * cosw0;
      b2 =   1;
      a0 =   1 + alpha;
      a1 =  -2.0 * cosw0;
      a2 =   1 - alpha;			
			break;	
		case "apf":
			// allpass filter
      b0 =   1 - alpha;
      b1 =  -2.0 * cosw0;
      b2 =   1 + alpha;
      a0 =   1 + alpha;
      a1 =  -2.0 * cosw0;
      a2 =   1 - alpha;
			break; 	
		case "bpf":	
			// bandpass filter, constant 0 dB peak gain
      b0 =   alpha;
      b1 =   0;
      b2 =  -alpha;
      a0 =   1 + alpha;
      a1 =  -2.0 * cosw0;
      a2 =   1 - alpha;		
			break;	
		case "bpf-peak":	
			// bandpass filter, constant skirt gain, peak gain = q
      b0 =   sinw0 / 2.0;  //=   q*alpha;
      b1 =   0;
      b2 =  -sinw0 / 2.0;  //=  -q*alpha;
      a0 =   1 + alpha;
      a1 =  -2.0 * cosw0;
      a2 =   1 - alpha;	
			break;	
		case "hpf":
			// highpass filter
      b0 =  (1 + cosw0) / 2.0;
      b1 = -(1 + cosw0);
      b2 =  (1 + cosw0) / 2.0;
      a0 =   1 + alpha;
      a1 =  -2.0 * cosw0;
      a2 =   1 - alpha;			
			break;
	  case "lpf":
			// lowpass filter
      b0 =  (1 - cosw0) / 2.0;
      b1 =   1 - cosw0;
      b2 =  (1 - cosw0) / 2.0;
      a0 =   1 + alpha;
      a1 =  -2.0 * cosw0;
      a2 =   1 - alpha;			 
			break;						
		default:
			break;  	
  }
	
	return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0,
		a0: a0
  };
}

/**
 * Return gain in dB for a given frequency for a filter
 */
function filterGain(filterCoeff, frequency) {
	// https://dsp.stackexchange.com/questions/16885/how-do-i-manually-plot-the-frequency-response-of-a-bandpass-butterworth-filter-i/16911#16911
	let {b0, b1, b2, a1, a2, a} = filterCoeff;
  let normalizedFrequency = frequency / samplerate;	
	let w = 2 * Math.PI * normalizedFrequency;
	let phi = Math.sin(w/2) * Math.sin(w/2);
	let first = ((b0 + b1 + b2)/2) * ((b0 + b1 + b2)/2) - phi * (4*b0*b2*(1-phi) + b1*(b0+b2));
	let second = ((a0+a1+a2)/2) * ((a0+a1+a2)/2) - phi * (4*a0*a2*(1-phi) + a1*(a0+a2));
	let dB = 10*Math.log10(first) - 10*Math.log10(second);
	return dB;
}
