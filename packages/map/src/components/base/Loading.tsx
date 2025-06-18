import ReactLoading from 'react-loading'

const Loading = () => (
  <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
    <div className='bg-transparent p-8 rounded-lg flex items-center justify-center'>
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
