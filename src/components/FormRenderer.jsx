import { useState, useEffect } from 'react';
import StepTracker from './StepTracker';
import AadhaarOtpModal from './AadhaarOtpModal';
import PanOtpModal from './PanOtpModal';
import { validateField } from '../utils/validators';
import { postPinLookup, submitRegistration } from '../api';
import schema from '../schema/udyamForm.json';

export default function FormRenderer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [aadhaarModal, setAadhaarModal] = useState(false);
  const [panModal, setPanModal] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=> {
    if (form.pinCode && form.pinCode.length === 6) {
      lookupPin(form.pinCode);
    }
  }, [form.pinCode]);

  async function lookupPin(pin) {
    try {
      const res = await postPinLookup(pin);
      // postalpincode.in returns an array - adapt to provider
      const data = res.data[0];
      if (data && data.Status === 'Success') {
        const postOffice = data.PostOffice && data.PostOffice[0];
        if (postOffice) setForm(f => ({ ...f, city: postOffice.District, state: postOffice.State }));
      }
    } catch (err) {
      // ignore
    }
  }

  function handleChange(name, value) {
    setForm(f => ({ ...f, [name]: value }));
    const e = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: e }));
  }
  
  const step = schema.steps.find(s => s.id === currentStep);
    async function handleSubmit() {
    // validate all required fields for current step and previous
    const allFields = schema.steps.flatMap(s => s.fields);
    const newErrors = {};
    allFields.forEach(f => {
      if (f.required) {
        const err = validateField(f.name, form[f.name] || '');
        if (err) newErrors[f.name] = err;
      }
    });

    if (!aadhaarVerified) newErrors['aadhaar'] = 'Aadhaar not verified';
    if (!panVerified) newErrors['pan'] = 'PAN not verified';

    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    // Submit
    setSubmitting(true);
    try {
      const payload = { ...form, aadhaarVerified, panVerified };
      const res = await submitRegistration(payload);
      console.log(res);
      alert('Registration Successful: ' + res.data.id);

      // Reset form, errors, verification, and step
      setForm({});
      setErrors({});
      setAadhaarVerified(false);
      setPanVerified(false);
      setCurrentStep(1);
    } catch (err) {
      alert('Submit failed: ', err);
    } finally {
      setSubmitting(false);
    }
  }
  
  return (
    <div className="container" style={{ padding:16, maxWidth:640, margin:'auto' }}>
      <h2>{schema.title}</h2>
      <StepTracker currentStep={currentStep} />
      <div>
        {step.fields.map(field => (
          <div key={field.name} style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:14 }}>{field.label}{field.required && '*'}</label>
            <input
              value={form[field.name] || ''}
              onChange={e=>handleChange(field.name, e.target.value)}
              onBlur={e=>handleChange(field.name, e.target.value)}
              style={{ width:'100%', padding:8, fontSize:16 }}
              
            />
            { (field.name === 'aadhaar' || field.name === 'pan') &&
              <button onClick={()=> field.name==='aadhaar' ? setAadhaarModal(true) : setPanModal(true)}>
                {field.name==='aadhaar' ? (aadhaarVerified ? 'Verified' : 'Verify Aadhaar') : (panVerified ? 'Verified' : 'Verify PAN')}
              </button>
            }
            {errors[field.name] && <div style={{ color:'red', fontSize:12 }}>{errors[field.name]}</div>}
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:8, marginTop:12 }}>
        {currentStep > 1 && <button onClick={()=>setCurrentStep(s=>s-1)}>Back</button>}
        {currentStep < schema.steps.length && <button onClick={()=>setCurrentStep(s=>s+1)}>Next</button>}
        {currentStep === schema.steps.length && <button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>}
      </div>

      {aadhaarModal && <AadhaarOtpModal aadhaar={form.aadhaar || ''} onVerified={(v)=>setAadhaarVerified(v)} onClose={()=>setAadhaarModal(false)} />}
      {panModal && <PanOtpModal pan={form.pan || ''} onVerified={(v)=>setPanVerified(v)} onClose={()=>setPanModal(false)} />}
    </div>
  );
}
