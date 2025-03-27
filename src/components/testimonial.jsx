import {Card,  CardContent } from "../components/ui/card";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Alex Johnson",
    feedback: "This platform helped me learn web development while teaching graphic design!",
    skillSwap: "Web Development ↔️ Graphic Design"
  },
  {
    id: 2,
    name: "Priya Sharma",
    feedback: "I improved my Spanish while helping others with coding. Amazing community!",
    skillSwap: "Spanish ↔️ Coding"
  },
  {
    id: 3,
    name: "James Lee",
    feedback: "A perfect place to share knowledge and grow your skills simultaneously.",
    skillSwap: "Photography ↔️ Video Editing"
  }
];

export default function Testimonials() {
  return (
    <section className="mt-12 max-w-5xl text-white py-12">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-teal-400 mb-8 text-center">What Our Users Say</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: testimonial.id * 0.2 }}
            >
              <Card className="mt-9 bg-gray-900 h-[250px] rounded-2xl shadow-lg hover:shadow-teal-500/40 transition-shadow">
                <CardContent className="p-3">
                  <p className="text-lg italic mb-4">"{testimonial.feedback}"</p>
                  <h3 className="text-lg font-semibold text-teal-300">{testimonial.name}</h3>
                  <p className="text-sm mt-2 text-gray-400">{testimonial.skillSwap}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
