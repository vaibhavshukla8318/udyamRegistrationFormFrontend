import React from 'react'
import FormRenderer from './components/FormRenderer'
import StepTracker from './components/StepTracker'


const App = () => {
  return (
    <div className="container">
      <StepTracker />
      <FormRenderer />
    </div>
  )
}

export default App