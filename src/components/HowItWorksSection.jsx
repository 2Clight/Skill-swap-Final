import { CheckCircle2 } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Sign up and create your profile listing skills you want to share and learn.",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      number: "02",
      title: "Discover Matches",
      description: "Browse our community to find people with complementary skill offerings.",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      number: "03",
      title: "Connect & Agree",
      description: "Reach out, discuss the details, and agree on your skill exchange arrangement.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    },
    {
      number: "04",
      title: "Exchange Skills",
      description: "Meet virtually or in-person to share your knowledge and learn something new.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    }
  ];

  const benefits = [
    "No money needed, just exchange of value",
    "Learn directly from experienced practitioners",
    "Build meaningful connections with like-minded people",
    "Develop new skills at your own pace",
    "Access knowledge that might be otherwise expensive",
    "Join a supportive community of lifelong learners"
  ];

  // Debugging to check if steps exist
  console.log(steps);

  return (
    <section id="how-it-works" className="section-padding">
      <div className="container-tight">
      <h1 className="-mt-12 pb-7 text-5xl md:text-5xl font-bold mb-16 fade-in text-center">How It Works</h1>
        
        {/* Steps */}
        <div className="space-y-20 mt-16">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              {/* Image */}
              <div className={`order-2 ${index % 2 === 1 ? "md:order-1" : "md:order-2"}`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/30 to-indigo-500/10 rounded-2xl transform rotate-3"></div>
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="relative rounded-2xl shadow-lg w-full h-auto object-cover aspect-video"
                    loading="lazy"
                  />
                </div>
              </div>
              
              {/* Text Content */}
              <div className={`order-1 ${index % 2 === 1 ? "md:order-2" : "md:order-1"}`}>
                <div className="inline-block text-4xl font-bold text-cyan-500 mb-4 opacity-75">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-teal-300">{step.title}</h3>
                <p className="text-lg text-white mb-6">{step.description}</p>
                
                {/* Button on last step */}
                {index === steps.length - 1 && (
                  <a 
                    href="#contact" 
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-teal-600 text-white font-medium transition-all hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/20"
                  >
                    Start Swapping
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Benefits Section */}
        <div className="mt-24 bg-card rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl font-bold mb-8 text-center text-white">
            Benefits of Skill Swapping
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3 p-4">
                <CheckCircle2 className="text-teal-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
