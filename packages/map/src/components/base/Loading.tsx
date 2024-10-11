import ReactLoading from 'react-loading'

import './Loading.scss'

const Loading = () => (
  <div className='spinner--screen'>
    <div className='spinner--container'>
      <ReactLoading
        type='spinningBubbles'
        color='#ffffff'
        height={100}
        width={150}
      />
    </div>
  </div>
)

export default Loading
