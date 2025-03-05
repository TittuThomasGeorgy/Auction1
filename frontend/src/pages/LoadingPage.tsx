import Lottie from 'react-lottie';
import Animations from '../animations';
const LoadingPage = () => {
    return (
        <Lottie
            options={{
              loop: true,
              autoplay: true,
              animationData: Animations.loading,
              rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice',
              },
            }}
            height={200}
            width={200}
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}

          />
    );
};

export default LoadingPage;
