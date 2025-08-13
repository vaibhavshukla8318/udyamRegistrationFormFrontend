
export default function StepTracker({ currentStep }) {
  return (
    <div className="step-tracker" style={{ display:'flex', gap:8, alignItems:'center', marginBottom:16 }}>
      {[1,2].map(step => (
        <div key={step} style={{ flex:1, textAlign:'center' }}>
          <div style={{
            width:32, height:32, borderRadius:16,
            margin:'0 auto',
            background: currentStep>=step ? '#036' : '#ddd',
            color:'#fff', lineHeight:'32px'
          }}>{step}</div>
          <div style={{ fontSize:12, marginTop:6 }}>{step===1 ? 'Identity' : 'Address'}</div>
        </div>
      ))}
    </div>
  );
}
