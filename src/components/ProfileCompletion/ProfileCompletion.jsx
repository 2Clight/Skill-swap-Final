import React, { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ProfileCompletion = () => {
  const [step, setStep] = useState(1); // Tracks the current step
  const [profileName, setProfileName] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [languages, setLanguages] = useState('');
  const [possessedSkills, setPossessedSkills] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  // Skill Categories
  const skillCategories = [
    {
      category: 'Programming Languages',
      skills: ['JavaScript', 'Python', 'Java', 'C++'],
    },
    {
      category: 'Frameworks',
      skills: ['React', 'Angular', 'Django', 'Flask'],
    },
    {
      category: 'Tools',
      skills: ['Git', 'Docker', 'Kubernetes', 'Figma'],
    },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/'); // Redirect to login if not logged in
    } else {
      const fetchUserData = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileName(data.profileName || '');
          setGender(data.gender || '');
          setCountry(data.country || '');
          setPossessedSkills(data.possessedSkills || []);
          setSkillsToLearn(data.skillsToLearn || []);
          setLanguages(data.languages || '');
        }
      };
      fetchUserData();
    }
  }, [navigate, user]);

  const toggleSkill = (skill, skillType) => {
    if (skillType === 'possessed') {
      setPossessedSkills((prev) =>
        prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
      );
    } else if (skillType === 'learn') {
      setSkillsToLearn((prev) =>
        prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
      );
    }
  };

  const handleNext = () => setStep((prevStep) => prevStep + 1);
  const handlePrevious = () => setStep((prevStep) => prevStep - 1);

  const handleSubmit = async () => {
    if (!profileName || !gender || !country) {
      alert('Please complete all fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      const userName = docSnap.exists() ? docSnap.data().name : 'Anonymous';
      await setDoc(
        userDocRef,
        {
          name: userName || 'Anonymous',
          email: user.email,
          profileName,
          gender,
          country,
          possessedSkills,
          skillsToLearn,
          isProfileComplete: true,
          completedAt: new Date(),
          languages,
        },
        { merge: true }
      );

      alert('Profile completed successfully!');
      navigate('/Certificate'); // Navigate to another page after completion
    } catch (error) {
      console.error('Error saving profile: ', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold text-teal-400 mb-4">Choose a Profile Name</h2>
            <input
              type="text"
              className="w-full px-4 py-2 border border-teal-400 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="Enter your profile name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              required
            />
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold text-teal-400 mb-4">Select Your Gender</h2>
            <div className="space-y-2 text-white">
              <label className="flex items-center">
                <input
                  type="radio"
                  className="mr-2 accent-teal-500"
                  value="Male"
                  checked={gender === 'Male'}
                  onChange={(e) => setGender(e.target.value)}
                />
                Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  className="mr-2 accent-teal-500"
                  value="Female"
                  checked={gender === 'Female'}
                  onChange={(e) => setGender(e.target.value)}
                />
                Female
              </label>
             
            </div>
          </div>
        );
        case 3:
          return (
            <div>
              <h2 className="text-xl font-semibold text-teal-400 mb-4">Select Your Country</h2>
              <select
                className="w-full px-4 py-2 border border-teal-400 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select your country
                </option>
                <option value="United States">United States</option>
                <option value="India">India</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
            </div>
          );
      case 4:
        return (
          <div>
            <h2 className="text-xl font-semibold text-teal-400 mb-4">
              Enter Languages of Communication
            </h2>
            <textarea
              className="w-full px-4 py-2 border border-teal-400 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="e.g., English, Spanish, French"
              rows="3"
              required
            ></textarea>
            <p className="text-sm text-gray-400 mt-2">
              Enter multiple languages separated by commas.
            </p>
          </div>
        );
      case 5:
        return (
          <div>
            <h2 className="text-xl font-semibold text-teal-400 mb-4">Select Your Skills</h2>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-teal-300 mb-2">Possessed Skill Set</h3>
              {skillCategories.map((category) => (
                <div key={category.category} className="mb-4">
                  <h4 className="text-md font-semibold text-gray-300">{category.category}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {category.skills.map((skill) => (
                      <button
                        key={skill}
                        className={`px-4 py-2 rounded-lg ${possessedSkills.includes(skill)
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-700 text-gray-300'
                          }`}
                        onClick={() => toggleSkill(skill, 'possessed')}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-teal-300 mb-2">Skills to Learn</h3>
              {skillCategories.map((category) => (
                <div key={category.category} className="mb-4">
                  <h4 className="text-md font-semibold text-gray-300">{category.category}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {category.skills.map((skill) => (
                      <button
                        key={skill}
                        className={`px-4 py-2 rounded-lg ${
                          skillsToLearn.includes(skill)
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                        onClick={() => toggleSkill(skill, 'learn')}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
       
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-6 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-gray-300 hover:text-red-400"
          >
            Logout
          </button>
        </div>
        {renderStep()}
        <div className="flex justify-between">
          {step > 1 && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Previous
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={handleNext}
              className="ml-auto px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`ml-auto px-4 py-2 ${
                isSubmitting
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-teal-500 hover:bg-teal-400'
              } text-white rounded-lg`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
