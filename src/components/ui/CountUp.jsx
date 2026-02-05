import CountUp from 'react-countup';

const CountUpComponent = ({ end, suffix = '+', duration = 4 }) => {
  return <CountUp end={end} duration={duration} suffix={suffix} enableScrollSpy scrollSpyOnce />;
};

export default CountUpComponent;